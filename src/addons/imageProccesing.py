import numpy as np

class ImageProccessing:
    def my_convolution(image, kernels, padding, stride):
        (batch_size,  in_dim, _, in_channels_i) = image.shape
        (k_size, _, in_channels_k, amount) = kernels.shape

        assert in_channels_k == in_channels_i, "Number of channels in image and kernels must be the same"

        image = np.pad(image, ((0, 0), (padding, padding),
                       (padding, padding), (0, 0)))

        out_dim = int((in_dim + 2 * padding - k_size) / stride + 1)
        output = np.zeros((batch_size,  out_dim, out_dim, amount))

        for i in range(amount):
            c_kernel = kernels[:, :, :, i]
            curr_y = out_y = 0
            while curr_y + k_size <= in_dim + 2 * padding:
                curr_x = out_x = 0
                while curr_x + k_size <= in_dim + 2 * padding:
                    local = image[:, curr_y:curr_y +
                                  k_size, curr_x:curr_x + k_size, :]
                    output[:, out_y, out_x, i] = np.sum(
                        c_kernel * local, axis=(1, 2, 3))
                    curr_x += stride
                    out_x += 1
                curr_y += stride
                out_y += 1

        return output

    def my_max_pool(image, kernel_size, padding, stride):
        (batch_size, in_dim, _, in_channels_i) = image.shape
        image = np.pad(image, ((0, 0), (padding, padding),
                       (padding, padding), (0, 0)))

        out_dim = int((in_dim + 2 * padding -
                      kernel_size) / stride + 1)
        output = np.zeros((batch_size,  out_dim, out_dim, in_channels_i,))

        curr_y = out_y = 0
        while curr_y + kernel_size <= in_dim + 2 * padding:
            curr_x = out_x = 0
            while curr_x + kernel_size <= in_dim + 2 * padding:
                output[:, out_y, out_x, :] = np.amax(
                    image[:,  curr_y:curr_y + kernel_size, curr_x:curr_x + kernel_size, :], axis=(1, 2))
                curr_x += stride
                out_x += 1
            curr_y += stride
            out_y += 1

        return output
