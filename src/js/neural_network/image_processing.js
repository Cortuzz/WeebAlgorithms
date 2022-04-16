function convolution(image, kernels, padding, stride) {
    let in_dim = image.shape;
    let in_channels_i = in_dim[2]
    in_dim = in_dim[0]
    let k_size = kernels.shape
    let in_channels_k = k_size[2]
    let amount = k_size[3]
    k_size = k_size[0]
    let padded = nj.zeros([in_dim + 2 * padding, in_dim + 2 * padding, in_channels_i])
    padded.slice([padding, in_dim], [padding, in_dim], null).add(image, false)
    let out_dim = Math.round((in_dim + 2 * padding - k_size) / stride + 1)
    let output = nj.zeros([out_dim, out_dim, amount])

    for (let i = 0; i < amount; i++) {
        let c_kernel = kernels.slice(null, null, null, [i, i + 1]).clone().reshape(k_size, k_size, in_channels_i)
        let curr_y = 0, out_y = 0;
        while (curr_y + k_size <= in_dim + 2 * padding) {
            let curr_x = 0, out_x = 0;
            while (curr_x + k_size <= in_dim + 2 * padding) {
                let local = image.slice([curr_y, curr_y + k_size], [curr_x, curr_x + k_size], null)
                output.slice([out_y, out_y + 1], [out_x, out_x + 1], [i, i + 1]).add(nj.multiply(c_kernel, local).sum(), false);
                curr_x += stride;
                out_x += 1;
            }
            curr_y += stride;
            out_y += 1;
        }
    }
    return output;
};
