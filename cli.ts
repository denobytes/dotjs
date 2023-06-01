import { parse as argparse } from "https://deno.land/std@0.181.0/flags/mod.ts";
import { Graphviz } from "npm:@hpcc-js/wasm@2.13.0/graphviz";

const args = argparse(Deno.args, {
  boolean: [
    // instructions for this script
    "help",
  ],
  string: [
    // output options
    "output",
    "o",
  ],
});

const commandName = `dotjs`;

const usageMessage = `
Usage: ${commandName} [OPTIONS] [-o OUTPUT-FILE] [DOT-FILE]
Render graphviz dot-file format files (to svg)

Options:
  --help              Show this help message

  -o, --output NAME   Write output to NAME

  Examples:
  ${commandName} sample.dot
  ${commandName} -o sample.svg sample.dot
  cat 'digraph G { Hello -> World }' | ${commandName}
`;

// parse args
const help = args.help;
const readStdin = args._.length == 0;
const outputFilename = args.output || args.o;

let dotStr = "";

if (help) {
  console.log(usageMessage);
  Deno.exit();
}

if (readStdin) {
  const decoder = new TextDecoder();
  for await (const chunk of Deno.stdin.readable) {
    const textChunk = decoder.decode(chunk);
    dotStr += textChunk;
  }
} else {
  const inputFilename = args._.at(0);

  dotStr = await Deno.readTextFile(inputFilename);
}

const graphviz = await Graphviz.load();
const result = graphviz.dot(dotStr);

if (outputFilename) {
  try {
    Deno.writeTextFileSync(outputFilename, result);
  } catch (e) {
    console.log(e);
  }
} else {
  console.log(result);
}
