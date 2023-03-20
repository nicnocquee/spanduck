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
import {
  createImageStorage,
  getImageStorage,
  uploadToImageStorage,
} from "../usecases/storage/images";

Handlebars.registerHelper("isEqual", function (value1, value2) {
  return value1 === value2;
});

export class ImageTemplateEngine {
  private source = "";
  private data:
    | ITwitterData
    | IImageData
    | WebImageMetadataSchemaType
    | TwitterImageMetadataSchemaType;
  private is_premium: boolean = false;

  private isTwitterData(
    data: any
  ): data is ITwitterData | TwitterImageMetadataSchemaType {
    return data.tweet_url !== undefined || data.tweet_id !== undefined;
  }

  constructor(
    data:
      | ITwitterData
      | IImageData
      | WebImageMetadataSchemaType
      | TwitterImageMetadataSchemaType,
    is_premium: boolean
  ) {
    this.data = data;

    if (is_premium === true) {
      this.is_premium = is_premium;
    }

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
    const html = template({
      ...this.data,
      source: this.source,
      is_premium: this.is_premium,
    });

    // Generate the image based on the HTML
    const image = await nodeHtmlToImage({
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

    // Check if bucket existed
    const isBucketExists = await getImageStorage();
    if (!isBucketExists) {
      await createImageStorage();
    }

    // Read file as buffer and upload the file to bucket
    const { error } = await uploadToImageStorage(fileName, image as Buffer, {
      upsert: true,
    });
    if (error) {
      throw new Error(error.message);
    }
  }
}
