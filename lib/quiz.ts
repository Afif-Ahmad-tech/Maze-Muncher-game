export type Question = {
q: string
options: string[]
answer: number
}

function shuffle<T>(arr: T[]): T[] {
return [...arr].sort(() => Math.random() - 0.5)
}

function mathQuestion(level: number): Question {
const max = 10 + level * 3

const a = Math.floor(Math.random() * max)
const b = Math.floor(Math.random() * max)

const correct = a + b

const answers = shuffle([
String(correct),
String(correct + 1),
String(correct - 1),
String(correct + 2),
])

return {
q: "What is " + a + " + " + b + "?",
options: answers,
answer: answers.indexOf(String(correct)),
}
}

function geographyQuestion(): Question {
const questions = [
{
q: "What is the capital of Japan?",
correct: "Tokyo",
wrong: ["Seoul", "Bangkok", "Beijing"],
},
{
q: "What is the capital of India?",
correct: "New Delhi",
wrong: ["Mumbai", "Chennai", "Kolkata"],
},
{
q: "Which continent is Egypt in?",
correct: "Africa",
wrong: ["Asia", "Europe", "Australia"],
},
]

const item = questions[Math.floor(Math.random() * questions.length)]
const options = shuffle([item.correct, ...item.wrong])

return {
q: item.q,
options,
answer: options.indexOf(item.correct),
}
}

function scienceQuestion(): Question {
const questions = [
{
q: "What gas do plants absorb?",
correct: "Carbon dioxide",
wrong: ["Oxygen", "Hydrogen", "Nitrogen"],
},
{
q: "What planet is known as the Red Planet?",
correct: "Mars",
wrong: ["Venus", "Jupiter", "Saturn"],
},
]

const item = questions[Math.floor(Math.random() * questions.length)]
const options = shuffle([item.correct, ...item.wrong])

return {
q: item.q,
options,
answer: options.indexOf(item.correct),
}
}

function programmingQuestion(): Question {
const questions = [
{
q: "Which language is used for React?",
correct: "JavaScript",
wrong: ["Python", "Java", "C++"],
},
{
q: "What does HTML stand for?",
correct: "HyperText Markup Language",
wrong: [
"High Text Machine Language",
"Hyper Transfer Markup Language",
"Home Tool Markup Language",
],
},
]

const item = questions[Math.floor(Math.random() * questions.length)]
const options = shuffle([item.correct, ...item.wrong])

return {
q: item.q,
options,
answer: options.indexOf(item.correct),
}
}

export function generateQuestion(level: number): Question {
const categories = [
() => mathQuestion(level),
() => geographyQuestion(),
() => scienceQuestion(),
() => programmingQuestion(),
]

const randomIndex = Math.floor(Math.random() * categories.length)

return categories[randomIndex]()
}
