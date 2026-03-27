package Chat.app.service.impl;

import Chat.app.domain.User;
import Chat.app.domain.dto.ReqUpdateAvatar;
import Chat.app.errors.IdInvalidException;
import Chat.app.repository.UserRepository;
import Chat.app.response.ResUploadFileDTO;
import Chat.app.service.UploadFileService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.Optional;

@Service
public class UploadFileServiceImpl implements UploadFileService {
    private final UserRepository userRepository;

    public UploadFileServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Value("${hoidanit.upload-file.base-uri}")
    private String baseUri;

    @Override
    public void createNewFolder(String folder) throws URISyntaxException {
        URI uri = new URI(folder);
        Path path = Paths.get(uri);
        File tmpDir = new File(path.toString());
        if (!tmpDir.isDirectory()) {
            try {
                Files.createDirectory(tmpDir.toPath());
                System.out.println(">>> CREAETE DIRECTORY SUCCESS! , PATH = " + tmpDir.toPath());
            } catch (IOException e) {
                e.printStackTrace();
            }
        } else {
            System.out.println("SKIP MAKING DIRECTORY , FOLDER EXIST!");
        }
    }

    public String storeFileInFolder(MultipartFile file, String folder) throws URISyntaxException, IOException {
        // TẠO 1 TÊN KHÔNG TRÙNG
        String finalName = System.currentTimeMillis() + "-" + file.getOriginalFilename();
        URI uri = new URI(baseUri + folder + "/" + finalName);
        Path path = Paths.get(uri);
        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, path, StandardCopyOption.REPLACE_EXISTING);
        }
        return finalName;
    }

    public long getFileLength(String fileName, String folder) throws URISyntaxException {
        URI uri = new URI(baseUri + folder + "/" + fileName);
        Path path = Paths.get(uri);
        File tmpDir = new File(path.toString());
        if (!tmpDir.exists() || tmpDir.isDirectory()) {
            return 0;
        }
        return tmpDir.length();
    }

    public InputStreamResource getResource(String fileName, String folder) throws URISyntaxException, FileNotFoundException {
        URI uri = new URI(baseUri + folder + "/" + fileName);
        Path path = Paths.get(uri);
        File file = new File(path.toString());

        return new InputStreamResource(new FileInputStream(file));
    }

    @Override
    public String updateAvatar(ReqUpdateAvatar req) throws IdInvalidException {
        String username = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();
        Optional<User> userCheck = this.userRepository.findByUsername(username);
        if (userCheck.isEmpty()) {
            throw new IdInvalidException("User not found in database !");
        }
        //upload
        userCheck.get().setAvatar(req.getAvatar());
        //save
        this.userRepository.save(userCheck.get());

        return  "Update avatar successfully";


    }
}
