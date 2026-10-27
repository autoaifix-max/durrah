import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { renderToString } from "react-dom/server";
import App from "../client/src/App";

const indexPath = resolve("dist/public/index.html");
const html = await readFile(indexPath, "utf8");
const placeholder = '<div id="root"></div>';
if (!html.includes(placeholder))
  throw new Error("Static HTML root placeholder not found");
const body = renderToString(<App />);
await writeFile(
  indexPath,
  html.replace(
    placeholder,
    `<div id="root" data-prerendered="true">${body}</div>`
  )
);
console.log("[Static HTML] Arabic homepage rendered with full page content.");
