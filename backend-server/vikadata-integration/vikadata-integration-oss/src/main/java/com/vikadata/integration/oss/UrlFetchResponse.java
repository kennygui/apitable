package com.vikadata.integration.oss;

/**
 * <p>
 * 网络资源上传结果
 * </p>
 * @author Shawn Deng
 * @date 2021/11/8 18:04
 */
public class UrlFetchResponse {

    private String keyName;

    private String hash;

    private Long size;

    private String mimeType;

    public UrlFetchResponse() {
    }

    public UrlFetchResponse(String keyName, String hash, Long size, String mimeType) {
        this.keyName = keyName;
        this.hash = hash;
        this.size = size;
        this.mimeType = mimeType;
    }

    public String getKeyName() {
        return keyName;
    }

    public void setKeyName(String keyName) {
        this.keyName = keyName;
    }

    public String getHash() {
        return hash;
    }

    public void setHash(String hash) {
        this.hash = hash;
    }

    public Long getSize() {
        return size;
    }

    public void setSize(Long size) {
        this.size = size;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    @Override
    public String toString() {
        return "UrlFetchResponse{" +
                "digest='" + hash + '\'' +
                ", size=" + size +
                ", mimeType='" + mimeType + '\'' +
                '}';
    }
}
