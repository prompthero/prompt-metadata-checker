import { Controller } from "@hotwired/stimulus"

import * as FilePond from "filepond";
import FilePondPluginImageResize from 'filepond-plugin-image-resize';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

PngToy = window.PngToy
import PromptInfo from "vendor/he1co_postie/prompt_info";
export default class extends Controller {
  static targets = [ "prompt", "negativePrompt", "modelUsed", "modelVersion", "sampler", "seed", "guidance_scale", "steps", "width", "height", "modelHash", "programUsed" ]

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

      var pngtoy = new PngToy();

      var fr = new FileReader();

      var that = this;

      fr.onload = function () {

        var buffer = this.result;

        pngtoy.fetch(buffer).then( () => {
          var promptInfo = new PromptInfo();

          promptInfo.decodeExif(pngtoy);

          if (!promptInfo.prompt){
            console.warn("No prompt metadata found, leaving form as is...")
          }
          else {
            console.log("Prompt metadata found. Filling up form...")
            that.fillUpFormWithPromptInfo(promptInfo);
          }
        }, (e) => { console.error('Error decoding metadata with PngToy', e) });

      };

      fr.readAsArrayBuffer(file.file);

    });
  }

  fillUpFormWithPromptInfo(promptInfo){
    this.promptTarget.value = promptInfo.prompt;

    if(promptInfo.negativePrompt){
      this.negativePromptTarget.value = promptInfo.negativePrompt;
      $("#negativePromptButtonToggler").click();
    }

    if(promptInfo.model){
      this.modelUsedTarget.value = promptInfo.model.toLowerCase();
    }
    this.modelVersionTarget.value = promptInfo.modelVersion;

    this.samplerTarget.value = promptInfo.sampler;
    this.seedTarget.value = promptInfo.seed;
    this.guidance_scaleTarget.value = promptInfo.cfg;
    this.stepsTarget.value = promptInfo.steps;

    this.widthTarget.value = promptInfo.width;
    this.heightTarget.value = promptInfo.height;
    this.modelHashTarget.value = promptInfo.modelId;

    this.programUsedTarget.value = promptInfo.program;

  }
}