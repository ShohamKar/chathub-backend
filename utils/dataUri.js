import DataURIParser from "datauri/parser.js";
import path from "path";

let getDataUri = (file) => {
  let parser = new DataURIParser();
  return parser.format(path.extname(file.originalname).toString(), file.buffer);
};

export default getDataUri;
