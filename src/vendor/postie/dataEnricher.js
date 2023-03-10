import hashes from "vendor/postie/modelHashes"

const findModelByHash = hash => {
  if (hash) {
    for (const [model, versions] of Object.entries(hashes)) {
      for (const [version, hashes] of Object.entries(versions)) {

        // Matches hash from Civit AI
        if (hashes.includes(hash.toUpperCase())) {
          return { model, version }
        }

        // Matches hash from Hugging Face
        if (hashes.includes(hash.toLowerCase())) {
          return { model, version }
        }
      }
    }
  }

  return { model: undefined, version: undefined }
}


/**
 * @param {string} sampler
 * @returns {string}
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

  return Object.keys(samplersDict).find(
        x => x === sampler.toLowerCase() || samplersDict[x].includes(sampler)
    ) ?? sampler
}


/**
 * @param {string} hires_upscaler
 * @returns {string}
*/
const findUpscaler = hires_upscaler => {
  if (hires_upscaler && hires_upscaler.indexOf('ESRGAN 4x') !== -1) {
    return 'ESRGAN 4x'
  }
  else if (hires_upscaler && hires_upscaler.indexOf('CodeFormer') !== -1) {
    return 'CodeFormer'
  } else {
    return ''
  }
}

export { findModelByHash, findSamplerByName, findUpscaler };