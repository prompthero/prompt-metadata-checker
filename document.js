var pngtoy = new PngToy();

function decodeChunkData() {
    try {
        var program;
        var promptText;
        var negativePromptText;
        var seed;
        var cfg;
        var steps;
        var width;
        var height;
        var sampler;
        const textChunk = pngtoy.getChunk("tEXt");
        if (!textChunk) { return; }
        const keyWord = textChunk[0].keyword;
        const keyText = textChunk[0].text;
        if (keyWord == 'parameters') {
            // Extract values from SD webUI image
            program = 'sdWebUi';
            var separateLines = keyText.split(/\r?\n|\r|\n/g);
            promptText = separateLines[0];
            if (separateLines[1].startsWith('Negative prompt:')) {
                negativePromptText = separateLines[1].substring(16).trim();
            }
            const settingsTextIndex = (typeof negativePromptText !== 'undefined') ? 2 : 1;
            const settingsTextArray = separateLines[settingsTextIndex].split(',');
            var settingsDict = {};
            settingsTextArray.forEach(element => {
                const list = element.split(':');
                settingsDict[String(list[0]).trim().replace(/\s/g, '')] = String(list[1]).trim();
            });
            seed = settingsDict.Seed;
            cfg = settingsDict.CFGscale;
            steps = settingsDict.Steps;
            width = settingsDict.Size.split('x')[0];
            height = settingsDict.Size.split('x')[1];
            sampler = settingsDict.Sampler;
        } else if (keyWord == 'Dream') {
            // Extract values from NMKD image
            program = 'nmkd';
            const rawPromptText = keyText.substring(1, keyText.indexOf('" -s'));
            const amountOfBrackets = (rawPromptText.match(/\[|\]/g) || []).length;
            if (amountOfBrackets != 0 && amountOfBrackets != 2) { return; }
            const regexNegativePromptMatch = rawPromptText.match(/\[([^)]+)\]/);
            if (regexNegativePromptMatch) {
                negativePromptText = regexNegativePromptMatch[1];
                promptText = rawPromptText.replace(regexNegativePromptMatch[0],'').replace(/,\s*$/,'');
            } else {
                promptText = rawPromptText.replace(/,\s*$/,'');
            }
            const settingsText = keyText.replace(rawPromptText,'').substring(3);
            seed = settingsText.match(/-S(.*)-W/)[1].trim();
            cfg = settingsText.match(/-C(.*)--f/)[1].trim();
            steps = settingsText.match(/-s(.*)-S/)[1].trim();
            width = settingsText.match(/-W(.*)-H/)[1].trim();
            height = settingsText.match(/-H(.*)-C/)[1].trim();
            sampler = settingsText.match(/-A(.*)-U/)[1].trim();
        }
        // console.log('### program:', program);
        // console.log('### promptText:', promptText);
        // console.log('### negativePromptText:', negativePromptText);
        // console.log('### seed:', seed);
        // console.log('### cfg:', cfg);
        // console.log('### steps:', steps);
        // console.log('### width:', width);
        // console.log('### height:', height);
        // console.log('### sampler:', sampler);
        fillUploadForm(program, promptText, negativePromptText, seed, cfg, steps, width, height, sampler);
    } catch (error) {
        console.log('Error:', error);
    }
}

function readImageFile(e) {
    function error(err) {console.log('Error. Could not load PNG file:', err)}
    var fr = new FileReader();
    fr.onload = function() {
        var buffer = this.result;
        pngtoy.fetch(buffer).then(decodeChunkData, error);
    };
    fr.readAsArrayBuffer(this.files[0])
}

function fillUploadForm(program, promptText, negativePromptText, seed, cfg, steps, width, height, sampler) {
  sdWebUiSamplerDict = {
    ddim: 'DDIM',
    plms: 'PLMS',
    k_euler: 'Euler',
    k_euler_ancestral: 'Euler a',
    k_heun: 'Heun',
    k_dpm_2: 'DPM2',
    k_dpm_2_ancestral: 'DPM2 a',
    k_lms: 'LMS'
  }
  nmkdSamplerDict = {
    ddim: 'ddim',
    plms: 'plms',
    k_euler: 'k_euler',
    k_euler_ancestral: 'k_euler_a',
    k_heun: 'k_heun',
    k_dpm_2: 'k_dpm_2',
    k_dpm_2_ancestral: 'k_dpm_2_a',
    k_lms: 'k_lms'
  }
  document.getElementById('prompt_prompt').value = promptText;
  if (negativePromptText) {
    document.getElementById('prompt_negative_prompt').value = negativePromptText;
  } else {
    document.getElementById('prompt_negative_prompt').value = '';
  }
  document.getElementById('prompt_metadata_seed').value = seed;
  document.getElementById('prompt_metadata_guidance_scale').value = cfg;
  document.getElementById('prompt_metadata_steps').value = steps;
  document.getElementById('prompt_metadata_width').value = width;
  document.getElementById('prompt_metadata_height').value = height;
  var samplerOption;
  if (program == 'sdWebUi') {
    samplerOption = Object.keys(sdWebUiSamplerDict).find(key => sdWebUiSamplerDict[key] === sampler);
  } else if (program == 'nmkd') {
    samplerOption = Object.keys(nmkdSamplerDict).find(key => nmkdSamplerDict[key] === sampler);
  }
  if (samplerOption) {
    document.getElementById('prompt_metadata_sampler').value = samplerOption;
  } else {
    document.getElementById('prompt_metadata_sampler').value = '';
  }
  var negativePromptElement = document.getElementById('negative-prompt-collapse');
  var otherMetadataElement = document.getElementById('other-metadata-collapse');
  if (negativePromptElement && otherMetadataElement) {
    negativePromptElement.classList.add('show');
    otherMetadataElement.classList.add('show');
  }
}

(function () {
  const addListener = () => {
    if (window.location.href == 'https://prompthero.com/prompt/upload') {
      try {
        const imageUploadField = document.getElementById('prompt_main_image');
        if (!imageUploadField.hasAttribute('extension-autofill-prompthero-uploads')) {
          document.getElementById('prompt_main_image').addEventListener('change', readImageFile, false);
          console.log('Added event listener hashchange');
          imageUploadField.setAttribute('extension-autofill-prompthero-uploads', true)
        }
      } catch (error) { return; }
    }
  };
  setInterval(addListener, 200);
})();