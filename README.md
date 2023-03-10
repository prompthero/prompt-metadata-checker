# Prompt Metadata Checker for Stable Diffusion Images

Read the EXIF metadata (`tEXT`, `IDAT`) and discover the prompt, seed, sampler, cfg_scale etc used to generate AI images. Works with images generated using AUTOMATIC1111, InvokeAI or NMKD. Supports `.png` and `.jpeg` images.

This is a port into PromptHero of a community extension originally made by [@HE1CO](https://github.com/HE1CO/Postie) and later revamped by [@drhino](https://github.com/drhino/Postie)


## Motivation
This is what we use in [our prompt upload page](https://prompthero.com/prompt/upload). When you drop a valid image generated with A1111 or a supported program, this is what auto-fills all the fields in the page.

## Contribute
If you would like for PromptHero to support reading the metadata of other file formats or images generated by other programs, please feel free to open a pull request!

## Features
 - Automagically fills upload info in the form after you choose a file
 - Works with images generated by [Stable Diffusion web UI](https://github.com/AUTOMATIC1111/stable-diffusion-webui), [InvokeAI](https://github.com/invoke-ai/InvokeAI), and [NMKD](https://nmkd.itch.io/t2i-gui)

## Limitations

 - NMKD: The model hash is not saved in the PNG metadata, so the model name and version can't be auto-filled
 - General: Inpainting overwrites the original prompt info, so the extension will autofill the inpaint prompt