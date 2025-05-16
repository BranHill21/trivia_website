package com.example.demo.helpers;

/*
 * Class for holding and interacting with questions pulled from API or created manually.
 */
public class Question {
	protected String question;
	protected String type;
	protected String difficulty;
	protected String correctAnswer;
	protected String[] incorrectAnswers;
	
	public Question (String newQuestion, String newType, String newDifficulty, String newCorrectAnswer, String[] newIncorrectAnswers) {
		question = newQuestion;
		type = newType;
		difficulty = newDifficulty;
		correctAnswer = newCorrectAnswer;
		incorrectAnswers = newIncorrectAnswers;
	}

	public String getQuestion() {
		return question;
	}

	public void setQuestion(String question) {
		this.question = question;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getDifficulty() {
		return difficulty;
	}

	public void setDifficulty(String difficulty) {
		this.difficulty = difficulty;
	}

	public String getCorrectAnswer() {
		return correctAnswer;
	}

	public void setCorrectAnswer(String correctAnswer) {
		this.correctAnswer = correctAnswer;
	}

	public String[] getIncorrectAnswers() {
		return incorrectAnswers;
	}

	public void setIncorrectAnswers(String[] incorrectAnswers) {
		this.incorrectAnswers = incorrectAnswers;
	}
	
	
}
