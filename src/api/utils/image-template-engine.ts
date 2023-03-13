import Handlebars from "handlebars";
import * as fsPromises from "node:fs/promises";
import path from "path";
import nodeHtmlToImage from "node-html-to-image";
import { ITwitterData } from "@/api/interfaces/twitter";
import { IImageData } from "@/api/interfaces/image";
import {
  TwitterImageMetadataSchemaType,
  WebImageMetadataSchemaType,
} from "../schemas/generated-image";
import {
  puppeteer,
  args,
  defaultViewport,
  executablePath,
} from "chrome-aws-lambda";

Handlebars.registerHelper("isEqual", function (value1, value2) {
  return value1 === value2;
});

export class ImageTemplateEngine {
  private data:
    | ITwitterData
    | IImageData
    | WebImageMetadataSchemaType
    | TwitterImageMetadataSchemaType;

  private isTwitterData(
    data: any
  ): data is ITwitterData | TwitterImageMetadataSchemaType {
    return data.tweet_url !== undefined || data.tweet_id !== undefined;
  }

  private source = "";

  constructor(
    data:
      | ITwitterData
      | IImageData
      | WebImageMetadataSchemaType
      | TwitterImageMetadataSchemaType
  ) {
    this.data = data;

    if (this.isTwitterData(data)) {
      this.source = "twitter";
    } else {
      this.source = "url";
    }
  }

  async generate(templateID: number, fileName: string) {
    // Get the contents of the HTML template
    const file = await fsPromises.readFile(
      path.resolve(`templates/${templateID}.html`),
      {
        encoding: "utf-8",
      }
    );

    // Compile the HTML with the data provided
    const template = Handlebars.compile(file);
    const html = template({ ...this.data, source: this.source });

    // Generate the image based on the HTML
    const outputPath = `/tmp/${fileName}`;
    const output = path.resolve(outputPath);
    await nodeHtmlToImage({
      output,
      html,
      puppeteer: puppeteer,
      puppeteerArgs: {
        args: [...args, "--hide-scrollbars", "--disable-web-security"],
        defaultViewport: defaultViewport,
        executablePath: await executablePath,
        headless: true,
        ignoreHTTPSErrors: true,
      },
    });

    return outputPath;
  }
}
