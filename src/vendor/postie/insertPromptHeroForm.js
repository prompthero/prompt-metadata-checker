const insertPromptHeroForm = async(promptInfo) => {

	console.log(promptInfo)

	// Shows the negative prompt box, if not shown
	document.getElementById('negative-prompt-collapse').classList.add('show')
	document.querySelector('a[data-target="#negative-prompt-collapse"]').style.display = 'none'

	document.getElementById('prompt_negative_prompt').setAttribute('placeholder', '')
	document.getElementById('prompt_prompt').setAttribute('placeholder', '')

	// Shows the `more metadata`, if not shown
	document.getElementById('other-metadata-collapse').classList.add('show')
	document.querySelector('a[data-target="#other-metadata-collapse"]').style.display = 'none'

	const findUpscaler = hires_upscaler => {
		if (hires_upscaler && hires_upscaler.indexOf('ESRGAN 4x') !== -1) {
			return 'ESRGAN 4x'
		} else {
			return ''
		}
	}

	// querySelector: value
	const map = {
		'#prompt_prompt':                      promptInfo.prompt,
		'#prompt_negative_prompt':             promptInfo.negative_prompt,
		'#prompt_metadata_seed':               promptInfo.seed,
		'#prompt_metadata_guidance_scale':     promptInfo.cfg_scale,
		'#prompt_metadata_steps':              promptInfo.steps,
		'#prompt_metadata_width':              promptInfo.width,
		'#prompt_metadata_height':             promptInfo.height,
		'#prompt_metadata_model_hash':         promptInfo.model_hash,
		'#prompt_metadata_denoising_strength': promptInfo.denoising_strength,
		'#prompt_metadata_sampler':            findSamplerByName(promptInfo.sampler),
		'#prompt_metadata_mask_blur':          promptInfo.mask_blur,
		'#prompt_metadata_upscaler':           findUpscaler(promptInfo.hires_upscaler),
		// Reset:
		'#prompt_model_used_slug': '',
		'#prompt_model_used_version': '',
	}

	for (const [querySelector, value] of Object.entries(map)) {
		const formElement = document.querySelector(querySelector)
		formElement.value = value || '' // NMKD value=0

		// A <select> returns an empty value when it's not an option
		/*
		if (formElement.value)
			formElement.setAttribute('disabled', true)
		else {
			formElement.removeAttribute('disabled')
			formElement.value = ''
		}
		*/
		if ( ! formElement.value ) formElement.value = ''
	}

	const modelSlug = document.getElementById('prompt_model_used_slug')
	const modelVers = document.getElementById('prompt_model_used_version')

	const { model, version } = findModelByHash(promptInfo.model_hash)

	if (model === undefined)
		return

	// Behaviour of prompthero:
	// First the DOM tree of the `modelVers` is reset
	// Then an AJAX request is sent to fetch the versions for that model
	// Finally the DOM tree of `modelVers` is populated with those contents
	const onDone = new Promise(resolve => {
		const observer = new MutationObserver(() => {
			// Means the AJAX has not finished, usually it's already finished
			// Test this properly by Throttling offline (in Google Chrome)
			//  in that case the Promise should never resolve (when offline)
			if (modelVers.innerText === '-- Select Model Version --')
				return

			observer.disconnect() // Stops listening for changes in the DOM
			resolve() // Continues, now the model version can be assigned
		})
		// Listens for changes within the DOM tree of the model version <select>
		observer.observe(modelVers, { childList: true })
	})

	modelSlug.value = model
	// Triggers the AJAX of prompthero
	modelSlug.dispatchEvent(new Event('change'))
	// Waits until the AJAX is done
	await onDone
	modelVers.value = version

	/*
	if (modelSlug.value)
		modelSlug.setAttribute('disabled', true)
	else
		modelSlug.value = ''

	if (modelVers.value)
		modelVers.setAttribute('disabled', true)
	else
		modelVers.value = ''
	*/
	if ( ! modelSlug.value ) modelSlug.value = ''
	if ( ! modelVers.value ) modelVers.value = ''
}
