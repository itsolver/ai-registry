import { describe, expect, it } from "vitest";
import { extractSpeechToTextRecords } from "../scripts/extract-aa-speech-to-text.mjs";

describe("AA speech-to-text extractor", () => {
  it("extracts supported provider rows from the summary table", () => {
    const html = `
      <table>
        <tbody>
          <tr>
            <td><div>Parakeet TDT 0.6B V2, NVIDIA</div></td>
            <td><span>NVIDIA</span></td>
            <td></td>
            <td>6.4%</td>
            <td>103.2</td>
            <td>0.00</td>
            <td><a href="/speech-to-text/models/nvidia">Details</a></td>
          </tr>
          <tr>
            <td><div>Whisper Large v3 Turbo</div></td>
            <td><span>Groq</span></td>
            <td>Large v3 Turbo</td>
            <td>4.6%</td>
            <td>235.5</td>
            <td>0.67</td>
            <td></td>
          </tr>
          <tr>
            <td><div>Parakeet TDT 0.6B V3, NVIDIA</div></td>
            <td><span>Together.ai</span></td>
            <td></td>
            <td>4.5%</td>
            <td>865.2</td>
            <td>1.50</td>
            <td></td>
          </tr>
          <tr>
            <td><div>Unsupported STT</div></td>
            <td><span>Deepgram</span></td>
            <td></td>
            <td>4.0%</td>
            <td>200</td>
            <td>1.00</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    `;

    const records = extractSpeechToTextRecords(html);

    expect(records).toHaveLength(3);
    expect(records[0]).toMatchObject({
      id: "nvidia-parakeet-tdt-0-6b-v2",
      model_creator: {
        slug: "nvidia",
      },
      aa_wer_index: 6.4,
      providers: [
        expect.objectContaining({
          price_per_1k_minutes: 0,
          median_speed_factor: 103.2,
        }),
      ],
    });
    expect(records[1]).toMatchObject({
      id: "groq-whisper-large-v3-turbo",
      model_creator: {
        slug: "groq",
      },
      providers: [
        expect.objectContaining({
          price_per_1k_minutes: 0.67,
          median_speed_factor: 235.5,
        }),
      ],
    });
    expect(records[2]).toMatchObject({
      id: "nvidia-parakeet-tdt-0-6b-v3-togetherai",
      model_creator: {
        slug: "nvidia",
      },
      providers: [
        expect.objectContaining({
          name: "Together.ai",
          slug: "togetherai",
          price_per_1k_minutes: 1.5,
          median_speed_factor: 865.2,
        }),
      ],
    });
  });
});
