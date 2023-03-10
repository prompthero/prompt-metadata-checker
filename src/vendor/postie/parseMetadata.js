import getTextFromImage from "vendor/postie/exifMetadataExtractor"

import { findSamplerByName, findUpscaler, findModelByHash } from "vendor/postie/dataEnricher"

// Parses the PNG/JPEG metadata
const parseMetadata = (file, callback) => {
  const fr = new FileReader()

  fr.onload = () => {
    let embed = getTextFromImage(fr.result)

    try {
      // Invoke AI / NMKD
      embed = JSON.parse(embed)
      embed = { ...embed, ...embed.image }

      // Ensures the prompt is a single string
      if (typeof embed.prompt !== 'string')
          embed.prompt = embed.prompt.map(x => x.prompt).join(', ')

      // Note: Nested brackets will parse the prompt-value wrong.
      // => Example: `[ negative1, negative2, [ negative3 ] ]` is invalid
      // => Example: `[ negative1, negative2, negative3 ]` is valid

      // Everything between square brackets, excluding those brackets
      // Multiple negatives are allowed, hence the following is valid:
      // => Example: `prompt [negate], prompt, [more negative]`
      embed.negative_prompt = embed.prompt.match(/\[[^\]]*\]/g)?.map(x => x.substr(1, x.length -2)).join(', ')

      // Everything that's not between square brackets
      // Same as above but just the other way around
      embed.prompt = embed.prompt.match(/[^\[\]]+(?=\[(.*)\]|$)/g).join(', ')
    }
    catch (e) {
      // Rethrow unless parsing as JSON failed
      // (which would have turned the string into an object)
      if (typeof embed !== 'string')
          throw e

      // Automatic 1111
      const split = embed.split(/\r?\n/)
      let entries = split.find(x => x.toLowerCase().startsWith('steps: '))

      // Finds each key-value pair. Note the leading: ', '
      //  which is used to form a consistent pattern
      // Also note that the value of a pair can be JSON, therefor
      //  we use `"` to ensure all JSON matches within that pair
      entries = `, ${entries}`.match(/(.+?(?=, [^"]+: |$))+?/g).map(pair => {
        // Splits the key-value pair on the first delimiter
        // This is different from `.split(': ')` !
        const index = pair.indexOf(': ')
        return [
          pair.substr(2, index -2).toLowerCase().replaceAll(' ', '_'),
          pair.substr(index +2)
        ]
      })
      entries = Object.fromEntries(entries)

      const [width, height] = entries.size.split('x')

      embed = {
        ...entries,
        prompt: split[0],
        negative_prompt: split.find(
            x => x.toLowerCase().startsWith('negative prompt: ')
        )?.substr(17),
        width,
        height,
      }
    }

    // Normalization
    const normalizer = str => str?.trim()
      .replace(/,( ?,)+/g, ',')          // separates with a maximum of one comma
      .replace(/^[\s?,]+|[\s?,]+$/g, '') // removes trailing/leading commas and whitespace
      .replace(/\s+/g, ' ')              // uses single spaces only

    embed.prompt = normalizer(embed.prompt)
    embed.negative_prompt = normalizer(embed.negative_prompt)

    // Handles the matching website
    console.log("Metadata parsed!", embed);
    embed = enrichMetadataForPromptHero(embed);
    callback(embed);
  }

  fr.readAsArrayBuffer(file)
}

const enrichMetadataForPromptHero = promptInfo => {
  var richPromptInfo = promptInfo;

  richPromptInfo.sampler_raw = promptInfo.sampler;
  richPromptInfo.sampler = findSamplerByName(promptInfo.sampler);

  richPromptInfo.upscaler_raw = promptInfo.hires_upscaler || "";
  richPromptInfo.upscaler = findUpscaler(promptInfo.hires_upscaler);

  const { model, version } = findModelByHash(promptInfo.model_hash)
  richPromptInfo.model_used = model;
  richPromptInfo.model_used_version = version;

  return richPromptInfo;
}

export default parseMetadata;