import { Controller } from "@hotwired/stimulus"

import * as FilePond from "filepond";
import FilePondPluginImageResize from 'filepond-plugin-image-resize';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

import parseMetadata from "vendor/postie/parseMetadata";

export default class extends Controller {
  static targets = [ "prompt", "negativePrompt", "modelUsed", "modelVersion", "sampler", "seed", "guidance_scale", "steps", "width", "height", "modelHash", "programUsed", "upscaler", "denoisingStrength", "maskBlur" ]

  initialize() {
    FilePond.registerPlugin(FilePondPluginImageResize, FilePondPluginImagePreview, FilePondPluginFileValidateType);
    const inputElement = document.getElementById("filepond-input");
    const pond = FilePond.create(inputElement, {
      required: true,
      acceptedFileTypes: ['image/*'],
      multiple: false,
      imageResizeMode: 'contain',
      allowImagePreview: true,
      allowProcess: true,
      storeAsFile: true,
      imagePreviewMinHeight: 600,
      imagePreviewMaxHeight: 800,
      imagePreviewMarkupShow: false
    });

    pond.on('addfile', (error, file) => {
      if (error) {
        console.error('Oh no! Error loading image.');
        return;
      }

      parseMetadata(file.file, (promptInfo) => {
        this.fillUpFormWithPromptInfo(promptInfo);
      });

    });
  }

  fillUpFormWithPromptInfo(promptInfo){
    this.promptTarget.value = promptInfo.prompt;

    if(promptInfo.negative_prompt){
      this.negativePromptTarget.value = promptInfo.negative_prompt;
      $("#negativePromptButtonToggler").click();
    }

    if(promptInfo.model_used){
      this.modelUsedTarget.value = promptInfo.model_used.toLowerCase();
      this.modelVersionTarget.value = promptInfo.model_used_version;
    }

    this.samplerTarget.value = promptInfo.sampler;
    this.seedTarget.value = promptInfo.seed;
    this.guidance_scaleTarget.value = promptInfo.cfg_scale;
    this.stepsTarget.value = promptInfo.steps;

    this.widthTarget.value = promptInfo.width;
    this.heightTarget.value = promptInfo.height;
    this.modelHashTarget.value = promptInfo.model_hash;

    this.programUsedTarget.value = promptInfo.program_used;

    this.upscalerTarget.value = promptInfo.upscaler;
    this.denoisingStrengthTarget.value = promptInfo.denoising_strength;
    this.maskBlurTarget.value = promptInfo.mask_blur;

  }
}