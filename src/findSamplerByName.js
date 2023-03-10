/**
 * @param {string} sampler
 * @returns {string}
 */
const findSamplerByName = sampler => {

  // @TODO: are these mappings correct? and complete?

  const samplersDict = {
    "ddim":                      [],
    "plms":                      [],
    "k_lms":                     ["LMS"],
    "k_euler_ancestral":         ["Euler a", "k_euler_a"],
    "k_euler":                   ["Euler"],
    "k_heun":                    ["Heun"],
    "k_dpm_2":                   ["DPM2"],
    "k_dpm_2_ancestral":         ["DPM2 a", "k_dpm_2_a"],
    "dpm++_2_ancestral":         ["k_dpmpp_2_ancestral"],
    "dpm++_2s_ancestral":        ["DPM++ 2S a", "k_dpmpp_2_a"],
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
