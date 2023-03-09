const insertArtHubForm = promptInfo => {

    console.log(promptInfo)

    // @TODO: test whether or not the dispatchEvent is required

    document.getElementById('message').value = promptInfo.prompt
    // document.getElementById("message").dispatchEvent(new Event("input", { bubbles: true }));

    let { model, version } = findModelByHash(promptInfo.model_hash)

    if (model === undefined) {
        model = promptInfo.model_hash

        // SHA256
        if (model?.length === 64) {
            // AutoV2
            model = model.substr(0, 10)
        }
    } else {
        model += ` ${version}`
    }

    let info = {
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
        negative:  promptInfo.negative_prompt,
    }

    info = Object.fromEntries( Object.entries(info).filter((k,v) => v !== undefined) )
    info = JSON.stringify(info, null, 2)

    document.getElementById('model-params').value = info
    // document.getElementById("model-params").dispatchEvent(new Event("input", { bubbles: true }));
}
