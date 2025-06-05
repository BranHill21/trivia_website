package com.example.demo.services;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.helpers.Question;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;

@Service
public class TriviaAPIService {
	private static final String API_BASE = "https://opentdb.com/api.php";
    private final HttpClient http = HttpClient.newHttpClient();
    private final ObjectMapper mapper = new ObjectMapper()
    		.setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);

    public ArrayList<Question> getQuestions(int num, Integer category, String difficulty) throws Exception {

        // Build query string safely
        StringBuilder qs = new StringBuilder("?amount=" + num);
        if (category != null) {
            qs.append("&category=").append(category);
        }
        if (difficulty != null && !difficulty.isBlank()) {
            qs.append("&difficulty=").append(encode(difficulty));
        }
        // Maybe adding type later (+ &type=multiple )

        URI uri = URI.create(API_BASE + qs);
        System.out.println(uri);

        // Start GET request
        HttpRequest request = HttpRequest.newBuilder()
                                         .uri(uri)
                                         .GET()
                                         .build();

        HttpResponse<String> resp =
                http.send(request, HttpResponse.BodyHandlers.ofString());

        if (resp.statusCode() != 200) {
            throw new IllegalStateException("OpenTDB returned HTTP "
                                            + resp.statusCode());
        }

        // Parse JSON
        System.out.println(resp.body());
        ApiResponse body = mapper.readValue(resp.body(), ApiResponse.class);

        if (body.response_code != 0) {   // 0 == success per OpenTDB docs
            throw new IllegalStateException("OpenTDB response_code = "
                                            + body.response_code);
        }
        
        System.out.println(body.results);
        return new ArrayList<>(body.results);
    }

    private static String encode(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }

    // api response helper
    @JsonIgnoreProperties(ignoreUnknown = true)
    static class ApiResponse {
        public int response_code;
        public List<Question> results;
    }
}
