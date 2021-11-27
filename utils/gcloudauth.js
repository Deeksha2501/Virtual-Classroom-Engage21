const { Storage } = require('@google-cloud/storage');

const keys = {
    "type": "service_account",
    "project_id": "virtual-classroom-ms",
    "private_key_id": "7d9b9b161daddaecd87f79ee1ff8b925aa6e12ab",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDRjCCwhobz6e6J\nd+XGXUYAhFEkY4e3Qdr4ChURj1/RO1E/0CdurhPu1iikt7yHPPeqQnxvxhRjz7Ru\nfsvO+T75pMH5FUgmKFwb7lSQmAtaILg3b08k2ZFvpkksufov4Df6Adue4kaLgAmr\npwvTjq6rB3FHtJALoB9W3bKrpuMuQzfH+PKnoLhSxxZY/IdHakw6w1iamp9e/SO8\nYYj1PV4lHR3msnXEPRLWH6w94cJNlmdKhmWYiB80S6rLUAxmUfQOgcQ2imTtLkQi\nJYH9Ia0O/gERFPFW64GTRLVnWcbhKLIRDl9viLJLEcDGaG+hL3Sl5rEzYXfa/ogG\nw64nMhq3AgMBAAECggEAQh+mVx30ava4S4/WpZxcUSBv3Hw94NG6r8e6s0JbeZJu\nxqTANLhg2N6ij6vdJY3TF1qImtrWJ1LtPGrtlF/pg+x+O0QAcu4MdtHjxIb+GhA2\nIWQSBO5U6vb9o0wCi2YFM/KvI3mCylV6d7ysSjN9ocGk+Pwc8lYyXX5y+aCdksSX\nzwtoOBJLvVqm1+LdInawnnKiqES8Qtbv85S2JT28oS8gsmJl/7qOJm/kgqyavxpi\nXwlt0y7VujPXXxNOm4TxTdVSJPvMFb86WnHeux+ZtZL4lP9lvmAHaU8UqxRd97OW\nciQTLEf0/4GGifssaPst4AOwfZQbg4wshAk9UCcixQKBgQD3l51wKBk1y3ARaMcI\ncYUE3uS3DHeUWzbcjLnWvrJHMgGDsc4Qt93S2YpAa/ymAUy9Vl28Y6SX+u4+fZUh\nQu3pwHGTdAJCS8lybE3fpCfxlcRrYOMTFlDQY842w2/LcJNYhMjj/DsleyM23/09\nzyz1dDVD0olyulJpnoea/TmQGwKBgQDYqcdOr9mPGPWbpMhFUDZ7k8HAAIl4nA/4\nwo1pwq3Z17XYBSIvXB80Fzjr0OQPL69U1PK41V2fHV6RMyA5dHcWVW7raozTdHxe\nXl1cO+sYsKSEY6aSlvYvwsCTcnQ6aPHqrjOUHfF3gKhYFNru7GAhx/1XGwHu/Hfa\nyp/eVrVhlQKBgGKdUcjVP81MXTOh7vxu8pNRD/nUjmBZwE0yA+cDh1CSG0ZP8Ip6\nIXEU0lr8Z+HazKzxFF6vtWQPPwtGy7o2xToAO3yGjUvIkdDwUEgOQxaXF2fJbEgy\n8DdAOWdYilOWYCm2oakk0o4IMKtvpZcTyI1vHrQHzFUU3zRQPyS9TUsXAoGAM5Rn\noHH4xzpX7k/SZb3s2oqYi48VKyNsIfqfE9iG7t+NqPm/46p4uzv0Dx/Ry1O81+NC\nTYJuIV0qkEKtnz/8wdJg76aUFBsdKJIqg7S4CU60O9hFZYyO21vv4KpUxTsKrKYA\nHXjrbVmxuhZs8IhRcnlb9Iq3cR+loO6wFIxr7ekCgYEAy9FDS70L3SVanVQV+abI\nozU2rA/1KbP3YTXAGbJimCCCr+y/tGLvEFXGhqdbhIhJK0UJFAa7Gxu6+j9P0WBN\npfpiNcN1vB6nmnApFOW7221sjKYkokqoPRdgdUb5oOqEjlrTdAq1uTUJ0ktbnKtB\nwKTjL2Ak1LRPpgxSITBPm4U=\n-----END PRIVATE KEY-----\n",
    "client_email": "class-buddy@virtual-classroom-ms.iam.gserviceaccount.com",
    "client_id": "114602434006750804025",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/class-buddy%40virtual-classroom-ms.iam.gserviceaccount.com"
};

const storage = new Storage({ projectId: keys.project_id, credentials: keys });

exports.storage = storage;