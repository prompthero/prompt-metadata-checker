/**
 * Returns the embedded data of a Stable Diffusion image
 * @param {ArrayBuffer} arrayBuffer
 * @returns {string}
 * @author drhino
 */
const getTextFromImage = arrayBuffer => {
  const uint8Array = new Uint8Array(arrayBuffer)

  const compiler = (start, end) => {
    if (start < 0) {
      end = uint8Array.length
      start = end + start
    }

    return String.fromCharCode(...uint8Array.slice(start, end))
  }

  const compileInteger = (start, type) => {
    switch (type) {
      case '16-bit':
        return (uint8Array[start] << 8) | uint8Array[start + 1]

      case '32-bit':
        return  (uint8Array[start] << 24) |
            (uint8Array[start + 1] << 16) |
            (uint8Array[start + 2] << 8)  |
             uint8Array[start + 3]

      default: throw new Error(`${type} is invalid (use 16-bit|32-bit)`)
    }
  }

  /**
   * JPEG
   */
  if (compiler(0, 2) === 'ÿØ' && compiler(-2) === 'ÿÙ') {
    let exif, i = 2

    // @TODO: if multiple APP1 with their own Exif, check for 'User comment'

    while (i < uint8Array.length) {
      // APP1 marker (2 bytes) / segmentLength / Exif identifier (6 bytes)
      if (compiler(i, i + 2) === 'ÿá' && compiler(i + 4, i + 10) === 'Exif\x00\x00') {

        // NOTE: pattern could differ (@TODO: exhaustive testing)

        // 28 should be fixed, after another 14 exifLength was found,
        //  which has 4 bytes, and last 4 bytes represent the position,
        //  which is not the value we want and is already calculated:
        const exifStart = i + 28 + 14 + 4 + 4
        const exifLength = compileInteger(i + 42, '32-bit')

        // Adds another 9 for 'UNICODE\x00\x00'
        exif = compiler(exifStart + 9, exifStart + exifLength)

        break
      }

      // Next segment
      const segmentLength = compileInteger(i + 2, '16-bit')
      i += segmentLength + 2
    }

    if (exif === undefined)
      throw new Error('Exif segment not found')

    // Returns the value without non-printable characters
    return exif.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  }

  /**
   * PNG
   */
  if (compiler(0, 8) === '\x89PNG\r\n\x1A\n') {
    let chunk, i = 8

    while (i < uint8Array.length) {
      // Chunk length (4 bytes, 32-bit integer)
      const length = compileInteger(i, '32-bit')

      // Chunk type (next 4 bytes)
      if (compiler(i + 4, i + 8) === 'tEXt') {
        // Chunk value
        chunk = compiler(i + 8, i + 8 + length)

        if (chunk.startsWith('parameters') || chunk.startsWith('sd-metadata'))
          break

        chunk = undefined
      }

      // Next chunk
      i += length + 12
    }

    if (chunk === undefined)
      throw new Error('tEXt chunk not found')

    // Returns the value after: 'parameters\u0000' or 'sd-metadata\u0000'
    return chunk.substr(chunk.indexOf('\u0000') + 1)
  }

  // ---

  throw new Error('Only JPEG and PNG files are supported')
}


export default getTextFromImage;