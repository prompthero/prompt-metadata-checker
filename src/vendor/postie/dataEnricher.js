import hashes from "vendor/postie/modelHashes"

/**
 * Returns the model and version from the model_hash
 *  The returned values are fixed identifiers from PromptHero.com
 * @param {string} hash
 * @returns { { model: string|undefined, version: string|undefined } }
 */
const findModelByHash = hash => {
  if (hash) {
    const hash_lowercase = hash.toLowerCase()

    for (const [model, versions] of Object.entries(hashes)) {
      for (const [version, hashes] of Object.entries(versions)) {

        if (hashes.find(x => x.toLowerCase() === hash_lowercase)) {
          return { model, version }
        }

        /*
        // Matches hash from Civit AI
        if (hashes.includes(hash.toUpperCase())) {
          return { model, version }
        }

        // Matches hash from Hugging Face
        if (hashes.includes(hash.toLowerCase())) {
          return { model, version }
        }
        */
      }
    }
  }

  return { model: undefined, version: undefined }
}


/**
 * Returns the normalized sampler name, if available on PromptHero.com
 * @param {string} sampler
 * @returns {string|undefined}
 */
const findSamplerByName = sampler => {
  // @TODO: are these mappings correct? and complete?
  const samplersDict = {
    "ddim":                      ["DDIM", "ddim"],
    "plms":                      ["PLMS", "plms"],
    "k_lms":                     ["LMS", "k_lms"],
    "k_euler_ancestral":         ["Euler a", "k_euler_a", "k_euler_ancestral"],
    "k_euler":                   ["Euler", "k_euler"],
    "k_heun":                    ["Heun", "k_heun"],
    "k_dpm_2":                   ["DPM2", "k_dpm_2"],
    "k_dpm_2_ancestral":         ["DPM2 a", "k_dpm_2_a", "k_dpm_2_ancestral"],
    "dpm++_2_ancestral":         ["k_dpmpp_2_ancestral", "k_dpmpp_2_a"],
    "dpm++_2s_ancestral":        ["DPM++ 2S a"],
    "dpm++_2":                   ["k_dpmpp_2"],
    "dpm++_2m":                  ["DPM++ 2M"],
    "dpm++_sde":                 ["DPM++ SDE"],
    "dpm++_sde_karras":          ["DPM++ SDE Karras"],
    "dpm_fast":                  ["DPM fast", "k_dpm_fast"],
    "dpm_adaptive":              ["DPM adaptive", "k_dpm_adaptive"],
    "dpm2_karras":               ["DPM2 Karras", "k_dpm_2_karras"],
    "dpm2_ancestral_karras":     ["DPM2 a Karras", "k_dpm_2_ancestral_karras"],
    "dpm++_2s_ancestral_karras": ["DPM++ 2S a Karras", "k_dpmpp_2_ancestral_karras"],
    "dpm++_2m_karras":           ["DPM++ 2M Karras", "k_dpmpp_2_karras"],
    "lms_karras":                ["LMS Karras", "k_lms_karras"],
  }

  return Object.keys(samplersDict).find(x => samplersDict[x].includes(sampler))
}


/**
 * Returns the normalized upscaler, if available on PromptHero.com
 * @param {string|undefined} hires_upscaler
 * @returns {string|undefined}
 */
const findUpscaler = hires_upscaler => {
  if ( ! hires_upscaler ) {
    return 
  }

  if (hires_upscaler.indexOf('ESRGAN 4x') !== -1) {
    return 'ESRGAN 4x'
  }

  if (hires_upscaler.indexOf('CodeFormer') !== -1) {
    return 'CodeFormer'
  }
}


/**
 * Generates the SHA-256 hash of a file
 * @param {ArrayBuffer} arrayBuffer
 * @returns {string} SHA-256
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
 */
const generateSha256Hash = async(arrayBuffer) => Array.from(
  new Uint8Array( await crypto.subtle.digest('SHA-256', arrayBuffer) )
).map(
    x => x.toString(16).padStart(2, '0')
).join('')


export { findModelByHash, findSamplerByName, findUpscaler, generateSha256Hash };
