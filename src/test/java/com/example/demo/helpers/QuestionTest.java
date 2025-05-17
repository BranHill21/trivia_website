package com.example.demo.helpers;

import static org.junit.jupiter.api.Assertions.*;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;

class QuestionTest {

	@Test
	void test() {
		Question testQuestion = new Question("how many eggs in a dozen", "General Knowledge", "multiple", "easy", "12", new ArrayList<String>(List.of("4", "6", "8")));
		assertNotNull(testQuestion);
	}

}
