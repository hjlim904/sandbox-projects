package com.practice.reactive.config;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SpringAiConfig {

    @Bean
    public ChatModel chatModel(
            @Value("${gemini.api-key:dummy-api-key}") String apiKey,
            @Value("${gemini.openai-base-url:https://generativelanguage.googleapis.com/v1beta/openai}") String baseUrl,
            @Value("${gemini.model:gemini-3.7-flash}") String model
    ) {
        OpenAiChatOptions options = OpenAiChatOptions.builder()
                .baseUrl(baseUrl)   // Gemini 엔드포인트 주소 설정
                .apiKey(apiKey)     // Gemini용 API 키 설정
                .model(model)       // 사용할 모델 지정
                .temperature(0.7)
                .build();

        // options 빌더
        return OpenAiChatModel.builder()
                .options(options)
                .build();
    }
}