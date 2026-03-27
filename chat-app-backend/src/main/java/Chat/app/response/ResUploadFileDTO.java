package Chat.app.response;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResUploadFileDTO {
private String fileName;
private String url;
private Instant uploadedAt;

}
