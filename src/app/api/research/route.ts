import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const RESEARCH_PROMPT = `You are a marketing intelligence analyst. Research the following company thoroughly using web search and produce a comprehensive report.

Company: {company}

Search for current, accurate information about this company. Use multiple searches to gather data about their business model, products, competitors, recent news, and market position.

After completing your research, output ONLY a valid JSON object (no markdown, no code fences, no extra text) with this exact structure:

{
  "companyName": "Official company name",
  "website": "company website URL",
  "overview": "2-3 paragraph overview of what the company does, their mission, and key facts",
  "businessModel": "Detailed explanation of how the company makes money, their revenue streams, pricing model, etc.",
  "targetMarket": "Description of their target customers, market segments, geographic focus, and ideal customer profile",
  "productsServices": [
    {
      "name": "Product/Service name",
      "description": "Brief description of the product or service"
    }
  ],
  "competitors": [
    {
      "name": "Competitor name",
      "description": "Brief description of competitor and how they compete",
      "website": "competitor website URL"
    }
  ],
  "recentNews": [
    {
      "title": "News headline",
      "summary": "Brief summary of the news item",
      "date": "Approximate date (e.g., January 2025)"
    }
  ],
  "marketPosition": {
    "category": "leader | challenger | niche | emerging",
    "description": "2-3 sentence analysis of their position in the market, market share insights, and competitive standing"
  },
  "keyMetrics": {
    "founded": "Year founded",
    "headquarters": "City, State/Country",
    "employeeCount": "Approximate number of employees or range",
    "fundingOrRevenue": "Known funding, valuation, or revenue information"
  }
}

Important:
- Include 3-5 main products/services
- Include 3-5 competitors
- Include 3-5 recent news items (prefer items from the last 12 months)
- All information must be based on your web research, not assumptions
- Output ONLY the JSON object, nothing else`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company } = body;

    if (!company || typeof company !== "string" || company.trim().length === 0) {
      return Response.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Anthropic API key is not configured. Set the ANTHROPIC_API_KEY environment variable." },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    const prompt = RESEARCH_PROMPT.replace("{company}", company.trim());

    // Use streaming to send progress updates to the client
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        function send(data: Record<string, unknown>) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        }

        try {
          send({
            type: "status",
            message: `Starting research on "${company.trim()}"...`,
          });

          const messageStream = client.messages.stream({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4096,
            tools: [
              {
                type: "web_search_20250305",
                name: "web_search",
                max_uses: 10,
              },
            ],
            messages: [{ role: "user", content: prompt }],
          });

          let searchCount = 0;

          messageStream.on("contentBlock", (block) => {
            if (block.type === "server_tool_use") {
              searchCount++;
              send({
                type: "status",
                message: `Searching the web (${searchCount})...`,
              });
            }
          });

          const finalMessage = await messageStream.finalMessage();

          send({ type: "status", message: "Analyzing results..." });

          // Extract text content from the response
          const textBlocks = finalMessage.content.filter(
            (block): block is Anthropic.TextBlock => block.type === "text"
          );

          if (textBlocks.length === 0) {
            send({ type: "error", message: "No text response received from AI" });
            controller.close();
            return;
          }

          const rawText = textBlocks.map((b) => b.text).join("");

          // Try to parse the JSON from the response
          // The model might wrap it in markdown code fences, so strip those
          let jsonText = rawText.trim();
          if (jsonText.startsWith("```")) {
            jsonText = jsonText
              .replace(/^```(?:json)?\s*\n?/, "")
              .replace(/\n?```\s*$/, "");
          }

          try {
            const report = JSON.parse(jsonText);
            send({ type: "report", data: report });
          } catch {
            // If JSON parsing fails, try to extract JSON from the text
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              try {
                const report = JSON.parse(jsonMatch[0]);
                send({ type: "report", data: report });
              } catch {
                send({
                  type: "error",
                  message: "Failed to parse the research report. Please try again.",
                });
              }
            } else {
              send({
                type: "error",
                message: "Failed to parse the research report. Please try again.",
              });
            }
          }
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "An unexpected error occurred";
          send({ type: "error", message });
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return Response.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
