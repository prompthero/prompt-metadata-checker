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
