package Chat.app.service;

import Chat.app.domain.dto.ReqUpdateAvatar;
import Chat.app.errors.IdInvalidException;
import Chat.app.response.ResUploadFileDTO;
import org.springframework.core.io.InputStreamResource;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URISyntaxException;

public interface UploadFileService {
    void createNewFolder(String folder) throws URISyntaxException;

    String storeFileInFolder(MultipartFile file, String folder) throws URISyntaxException, IOException;

    long getFileLength(String fileName, String folder) throws URISyntaxException;

    InputStreamResource getResource(String fileName, String folder) throws URISyntaxException, FileNotFoundException;

    String updateAvatar(ReqUpdateAvatar req) throws IdInvalidException;
}
