// eslint-disable-next-line
var pngtoy = new PngToy();

function decodeChunkData() {
    var program;
    var promptText;
    var negativePromptText;
    var seed;
    var cfg;
    var steps;
    var width;
    var height;
    var sampler;
    try {
        const textChunk = pngtoy.getChunk("tEXt");
        if (!textChunk) return;
        var keyText;
        if (textChunk.length > 1) {
            if (textChunk[1].keyword == "sd-metadata") { program = "invoke"; } // prettier-ignore
            keyText = textChunk[1].text;
        } else if (textChunk.length == 1) {
            if (textChunk[0].keyword == "parameters") { program = "sdWebUi"; } // prettier-ignore
            keyText = textChunk[0].text;
        }
        if (!program) return;
        if (program == "sdWebUi") {
            var separateLines = keyText.split(/\r?\n|\r|\n/g);
            promptText = separateLines[0];
            if (separateLines[1].startsWith("Negative prompt:")) {
                negativePromptText = separateLines[1].substring(16).trim();
            }
            const settingsTextIndex = negativePromptText ? 2 : 1;
            const settingsTextArray = separateLines[settingsTextIndex].split(",");
            var settingsDict = {};
            settingsTextArray.forEach((element) => {
                const list = element.split(":");
                settingsDict[String(list[0]).trim().replace(/\s/g, "")] = String(list[1]).trim();
            });
            seed = settingsDict.Seed;
            cfg = settingsDict.CFGscale;
            steps = settingsDict.Steps;
            width = settingsDict.Size.split("x")[0];
            height = settingsDict.Size.split("x")[1];
            sampler = settingsDict.Sampler;
        }
        if (program == "invoke") {
            const json = JSON.parse(keyText);
            const rawPromptText = json.image.prompt[0].prompt;
            const amountOfBrackets = (rawPromptText.match(/\[|\]/g) || []).length;
            if (amountOfBrackets != 0 && amountOfBrackets != 2) return;
            const regexNegativePromptMatch = rawPromptText.match(/\[([^)]+)\]/);
            if (regexNegativePromptMatch) {
                negativePromptText = regexNegativePromptMatch[1];
                promptText = rawPromptText.replace(regexNegativePromptMatch[0], "").replace(/,\s*$/, "");
            } else {
                promptText = rawPromptText.replace(/,\s*$/, "");
            }
            seed = json.image.seed;
            cfg = json.image.cfg_scale;
            steps = json.image.steps;
            width = json.image.width;
            height = json.image.height;
            sampler = json.image.sampler;
        }
        // console.log("### program:", program);
        // console.log("### promptText:", promptText);
        // console.log("### negativePromptText:", negativePromptText);
        // console.log("### seed:", seed);
        // console.log("### cfg:", cfg);
        // console.log("### steps:", steps);
        // console.log("### width:", width);
        // console.log("### height:", height);
        // console.log("### sampler:", sampler);
        fillUploadForm(program, promptText, negativePromptText, seed, cfg, steps, width, height, sampler);
    } catch (error) {
        console.log("Error:", error);
    }
}

function readImageFile() {
    function error(err) {
        console.log("Error. Could not load PNG file:", err);
    }
    var fr = new FileReader();
    fr.onload = function () {
        var buffer = this.result;
        pngtoy.fetch(buffer).then(decodeChunkData, error);
    };
    fr.readAsArrayBuffer(this.files[0]);
}

function fillUploadForm(program, promptText, negativePromptText, seed, cfg, steps, width, height, sampler) {
    const sdWebUiSamplersDict = {
        ddim: "DDIM",
        plms: "PLMS",
        k_euler: "Euler",
        k_euler_ancestral: "Euler a",
        k_heun: "Heun",
        k_dpm_2: "DPM2",
        k_dpm_2_ancestral: "DPM2 a",
        k_lms: "LMS",
        k_dpmpp_2: "DPM++ 2M",
        k_dpmpp_2_ancestral: "DPM++ 2S a",
        k_dpm_fast: "DPM fast",
        k_dpm_adaptive: "DPM adaptive",
        k_lms_karras: "LMS Karras",
        k_dpm_2_karras: "DPM2 Karras",
        k_dpm_2_ancestral_karras: "DPM2 a Karras",
        k_dpmpp_2_karras: "DPM++ 2M Karras",
        k_dpmpp_2_ancestral_karras: "DPM++ 2S a Karras",
    };
    const invokeSamplersDict = {
        ddim: "ddim",
        plms: "plms",
        k_euler: "k_euler",
        k_euler_ancestral: "k_euler_a",
        k_heun: "k_heun",
        k_dpm_2: "k_dpm_2",
        k_dpm_2_ancestral: "k_dpm_2_a",
        k_lms: "k_lms",
        k_dpmpp_2: "k_dpmpp_2",
        k_dpmpp_2_ancestral: "k_dpmpp_2_a",
    };
    document.getElementById("prompt_prompt").value = promptText;
    if (negativePromptText) {
        document.getElementById("prompt_negative_prompt").value = negativePromptText;
    } else {
        document.getElementById("prompt_negative_prompt").value = "";
    }
    document.getElementById("prompt_metadata_seed").value = seed;
    document.getElementById("prompt_metadata_guidance_scale").value = cfg;
    document.getElementById("prompt_metadata_steps").value = steps;
    document.getElementById("prompt_metadata_width").value = width;
    document.getElementById("prompt_metadata_height").value = height;
    var samplerOption;
    if (program == "sdWebUi") {
        samplerOption = Object.keys(sdWebUiSamplersDict).find((key) => sdWebUiSamplersDict[key] === sampler);
    } else if (program == "invoke") {
        samplerOption = Object.keys(invokeSamplersDict).find((key) => invokeSamplersDict[key] === sampler);
    }
    if (samplerOption) {
        if (samplerOption == "k_dpmpp_2") {
            document.getElementById("prompt_metadata_sampler").value = "dpm++_2";
        } else if (samplerOption == "k_dpmpp_2_ancestral") {
            document.getElementById("prompt_metadata_sampler").value = "dpm++_2_ancestral";
        } else {
            document.getElementById("prompt_metadata_sampler").value = samplerOption;
        }
    } else {
        document.getElementById("prompt_metadata_sampler").value = "";
    }
    var negativePromptElement = document.getElementById("negative-prompt-collapse");
    var otherMetadataElement = document.getElementById("other-metadata-collapse");
    if (negativePromptElement && otherMetadataElement) {
        negativePromptElement.classList.add("show");
        otherMetadataElement.classList.add("show");
    }
}

(function () {
    const addListener = () => {
        if (window.location.href == "https://prompthero.com/prompt/upload") {
            try {
                const imageUploadField = document.getElementById("prompt_main_image");
                if (!imageUploadField.hasAttribute("extension-autofill-prompthero-uploads")) {
                    document.getElementById("prompt_main_image").addEventListener("change", readImageFile, false);
                    // console.log("Added event listener hashchange");
                    imageUploadField.setAttribute("extension-autofill-prompthero-uploads", true);
                }
            } catch (error) {
                return;
            }
        }
    };
    setInterval(addListener, 200);
})();
