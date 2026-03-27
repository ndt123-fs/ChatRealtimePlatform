package Chat.app.controller;

import Chat.app.domain.dto.ReqUpdateAvatar;
import Chat.app.errors.IdInvalidException;
import Chat.app.errors.StorageException;
import Chat.app.response.ResUploadFileDTO;
import Chat.app.service.impl.UploadFileServiceImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URISyntaxException;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class UploadFileController {
    private final UploadFileServiceImpl uploadFileService;
    @Value("${hoidanit.upload-file.base-uri}")
    private String baseUri;

    public UploadFileController(UploadFileServiceImpl uploadFileService) {
        this.uploadFileService = uploadFileService;
    }

    @PostMapping("/files")
    public ResponseEntity<ResUploadFileDTO> upload(@RequestParam("file") MultipartFile file,
                                                   @RequestParam("folder") String folder) throws URISyntaxException, IOException {
        // check validated
        if (file == null && file.isEmpty()) {
            throw new StorageException("File is empty .Please upload a file!");
        }
        //
        String fileName = file.getOriginalFilename();
        List<String> alowedExtentions = Arrays.asList("pdf", "png", "jpg", "jpeg", "doc", "txt");
        boolean isValid = alowedExtentions.stream().anyMatch(item -> fileName.toLowerCase().endsWith(item));
        if (!isValid) {
            throw new StorageException("Invalid extention Exception , only alow : " + alowedExtentions.toString());
        }
        // tạo folder
        this.uploadFileService.createNewFolder((baseUri + folder)); // vi o  trong application co "/" nen k can nua
        //save file to folder
        String uploadFile = this.uploadFileService.storeFileInFolder(file, folder);
        String url = "http://localhost:8080/storage/chat/" + uploadFile ;
        ResUploadFileDTO res = new ResUploadFileDTO(uploadFile, url,Instant.now());


        return ResponseEntity.status(HttpStatus.CREATED.value()).body(res);
    }
    @PutMapping("/files/avatar")
    public ResponseEntity<String> updateAvatar(@RequestBody ReqUpdateAvatar req) throws IdInvalidException {
        return ResponseEntity.ok(this.uploadFileService.updateAvatar(req));

    }

}
