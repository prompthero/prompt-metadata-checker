const insertOpenArtForm = promptInfo => {

    console.log(promptInfo)

    // @TODO: should `Stable Diffusion` or `Other` be chosen for custom models?

    let prompt = promptInfo.prompt

    if (promptInfo.negative_prompt) {
        prompt += `, [${promptInfo.negative_prompt}]`
    }

    document.querySelector('input[name="prompt"]').value = prompt
    document.querySelector('input[name="prompt"]').dispatchEvent(new Event('change', { bubbles: true }))

    let description = ''
    let { model, version } = findModelByHash(promptInfo.model_hash)

    if (model === undefined) {
        model = promptInfo.model_hash

        // SHA256
        if (model?.length === 64) {
            // AutoV2
            model = model.substr(0, 10)
        }
    } else {
        model += `-${version}`
    }

    const info = {
        seed:      promptInfo.seed,
        model:     model,
        scale:     promptInfo.cfg_scale,
        steps:     promptInfo.steps,
        width:     promptInfo.width,
        height:    promptInfo.height,
        sampler:   promptInfo.sampler,
        upscale:   promptInfo.hires_upscaler,
        denoise:   promptInfo.denoising_strength,
        maskblur:  promptInfo.mask_blur,
    }

    for (const [key, value] of Object.entries(info)) {
        if (value === undefined)
            continue

      //description += ` /\/ ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`
        description += ` /\/ ${key}: ${value}`
    }

    document.querySelector('input[name="description"]').value = description.substr(4)
    document.querySelector('input[name="description"]').dispatchEvent(new Event('change', { bubbles: true }))
}

/*
const modelSelector = document.querySelector('input[name="ai_model"]');
modelSelector.value = "other";
if (promptInfo.modelId === 22408650) {
    modelSelector.value = "stable_diffusion";
}
modelSelector.dispatchEvent(new Event("change", { bubbles: true }));
*/
