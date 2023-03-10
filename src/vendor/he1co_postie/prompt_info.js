import ModelHashes from "vendor/he1co_postie/model_hashes";

class PromptInfo {
  // Class for extracting and storing prompt info
  constructor() {
    this.program = null;
    this.modelId = null;
    this.model = null;
    this.modelVersion = null;
    this.prompt = null;
    this.negativePrompt = null;
    this.seed = null;
    this.cfg = null;
    this.steps = null;
    this.width = null;
    this.height = null;
    this.sampler = null;
  }
  textToNumber(input) {
    // returns Number or null
    let value = Number(String(input).replace(",", "."));
    if (isNaN(value)) return null;
    return value;
  }
  set setModel(modelHash) {
    var modelHashes = new ModelHashes();
    [this.modelId, this.model, this.modelVersion] = modelHashes.resolve(modelHash);
  }
  set setSeed(seed) {
    this.seed = this.textToNumber(seed);
  }
  set setCfg(cfg) {
    this.cfg = this.textToNumber(cfg);
  }
  set setSteps(steps) {
    this.steps = this.textToNumber(steps);
  }
  set setWidth(width) {
    this.width = this.textToNumber(width);
  }
  set setHeight(height) {
    this.height = this.textToNumber(height);
  }
  set setSampler(sampler) {
    const samplersDict = {
      "ddim": ["DDIM", "ddim"],
      "plms": ["PLMS", "plms"],
      "k_euler": ["Euler", "k_euler"],
      "k_euler_ancestral": ["Euler a", "k_euler_a", "k_euler_ancestral"],
      "k_heun": ["Heun", "k_heun"],
      "k_dpm_2": ["DPM2", "k_dpm_2"],
      "k_dpm_2_ancestral": ["DPM2 a", "k_dpm_2_a", "k_dpm_2_ancestral"],
      "k_lms": ["LMS", "k_lms"],
      "dpm++_2": ["DPM++ 2M", "k_dpmpp_2"],
      "dpm++_2_ancestral": ["DPM++ 2S a", "k_dpmpp_2_a", "k_dpmpp_2_ancestral"],
      "dpm_fast": "DPM fast",
      "dpm_adaptive": "DPM adaptive",
      "lms_karras": "LMS Karras",
      "dpm2_karras": "DPM2 Karras",
      "dpm2_ancestral_karras": "DPM2 a Karras",
      "dpm++_2m_karras": "DPM++ 2M Karras",
      "dpm++_2s_ancestral_karras": "DPM++ 2S a Karras",
    };
    var key = Object.keys(samplersDict).find((key) => {
      if (Array.isArray(samplersDict[key])) {
        return samplersDict[key].includes(sampler);
      } else {
        return samplersDict[key] == sampler;
      }
    });
    this.sampler = key !== undefined ? key : String(sampler).toLowerCase().replace(/\s/g, "_");
  }
  decodeExif(pngtoyInstance) {
    // Translates exif data into prompt info and saves it to the class
    try {
      const textChunk = pngtoyInstance.getChunk("tEXt");
      if (!textChunk) {
        console.error("Prompt info could not be found. Only original images generated by Automatic1111, InvokeAI, and NMKD are supported.");
        return;
      }
      var keyText;
      if (textChunk.length >= 1 && textChunk[0].keyword == "parameters") {
        // this.program = "sdWebUi";
        this.program = "AUTOMATIC1111";
        keyText = textChunk[0].text;
      } else if (textChunk.length >= 2 && textChunk[1].keyword == "sd-metadata") {
        // this.program = "invoke";
        this.program = "InvokeAI";
        keyText = textChunk[1].text;
      } else {
        console.error("Prompt info could not be read. Only original images generated by Automatic1111, InvokeAI, and NMKD are supported.");
        return;
      }
      if (this.program == "AUTOMATIC1111") {
        var separateLines = keyText.split(/\r?\n|\r|\n/g);
        this.prompt = separateLines[0];
        if (separateLines[1].startsWith("Negative prompt:")) {
          this.negativePrompt = separateLines[1].substring(16).trim();
        }
        const settingsTextIndex = this.negativePrompt !== null ? 2 : 1;
        const settingsTextArray = separateLines[settingsTextIndex].split(",");
        var settingsDict = {};
        settingsTextArray.forEach((element) => {
          const list = element.split(":");
          settingsDict[String(list[0]).trim().replace(/\s/g, "")] = String(list[1]).trim();
        });
        this.setModel = settingsDict.Modelhash;
        this.setSeed = settingsDict.Seed;
        this.setCfg = settingsDict.CFGscale;
        this.setSteps = settingsDict.Steps;
        this.setWidth = settingsDict.Size.split("x")[0];
        this.setHeight = settingsDict.Size.split("x")[1];
        this.setSampler = settingsDict.Sampler;
      }
      if (this.program == "InvokeAI") {
        const json = JSON.parse(keyText);
        const rawPromptText = json.image.prompt[0].prompt;
        const amountOfBrackets = (rawPromptText.match(/\[|\]/g) || []).length;
        if (amountOfBrackets != 0 && amountOfBrackets != 2) return;
        this.setModel = json.model_hash;
        const regexNegativePromptMatch = rawPromptText.match(/\[([^)]+)\]/);
        if (regexNegativePromptMatch) {
          this.negativePrompt = regexNegativePromptMatch[1];
          this.prompt = rawPromptText.replace(regexNegativePromptMatch[0], "").replace(/,\s*$/, "");
        } else {
          this.prompt = rawPromptText.replace(/,\s*$/, "");
        }
        this.setSeed = json.image.seed;
        this.setCfg = json.image.cfg_scale;
        this.setSteps = json.image.steps;
        this.setWidth = json.image.width;
        this.setHeight = json.image.height;
        this.setSampler = json.image.sampler;
      }
      console.log(this);
    } catch (error) {
      console.error("Something went wrong during reading the prompt info");
      console.log("Error:", error);
    }
  }
}

export default PromptInfo