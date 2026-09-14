import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database…');

  // --- Wipe in reverse-dependency order ---
  await prisma.bootcampLab.deleteMany();
  await prisma.labSubmission.deleteMany();
  await prisma.testCase.deleteMany();
  await prisma.bootcampMember.deleteMany();
  await prisma.lab.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.course.deleteMany();
  await prisma.bootcamp.deleteMany();
  await prisma.user.deleteMany();

  // --- Users ---
  const SALT = 10;
  const [adminHash, instructorHash, studentHash] = await Promise.all([
    bcrypt.hash('admin123', SALT),
    bcrypt.hash('instructor123', SALT),
    bcrypt.hash('student123', SALT),
  ]);

  const adminId      = randomUUID();
  const instructorId = randomUUID();
  const student1Id   = randomUUID();
  const student2Id   = randomUUID();

  await prisma.user.createMany({
    data: [
      { id: adminId,      email: 'admin@365daysofcoding.com',      name: 'Admin',       password_hash: adminHash,      role: 'admin' },
      { id: instructorId, email: 'instructor@365daysofcoding.com', name: 'Alex Chen',   password_hash: instructorHash, role: 'instructor' },
      { id: student1Id,   email: 'student1@365daysofcoding.com',   name: 'Sam Rivera',  password_hash: studentHash,    role: 'student' },
      { id: student2Id,   email: 'student2@365daysofcoding.com',   name: 'Jordan Lee',  password_hash: studentHash,    role: 'student' },
    ],
  });

  // --- Bootcamp ---
  const bootcampId = randomUUID();
  await prisma.bootcamp.create({
    data: {
      id: bootcampId,
      name: 'Batch 1',
      description: 'First cohort of 365daysofcoding.com learners.',
      created_by: adminId,
    },
  });

  await prisma.bootcampMember.createMany({
    data: [
      { bootcamp_id: bootcampId, user_id: instructorId, member_role: 'instructor' },
      { bootcamp_id: bootcampId, user_id: student1Id,   member_role: 'student' },
      { bootcamp_id: bootcampId, user_id: student2Id,   member_role: 'student' },
    ],
  });

  // --- Course ---
  const courseId = randomUUID();
  await prisma.course.create({
    data: {
      id: courseId,
      title: 'JavaScript Fundamentals',
      description: 'Master the core building blocks of JavaScript — from variables to functions.',
      order_index: 1,
    },
  });

  // --- Topics ---
  const t1 = randomUUID();
  const t2 = randomUUID();
  const t3 = randomUUID();

  await prisma.topic.createMany({
    data: [
      { id: t1, course_id: courseId, title: 'Variables & Types',  description: "Declare variables and work with JavaScript's primitive types.", order_index: 1 },
      { id: t2, course_id: courseId, title: 'Arrays',             description: 'Store and manipulate ordered collections of data.',             order_index: 2 },
      { id: t3, course_id: courseId, title: 'Functions',          description: 'Write reusable blocks of code with functions and arrow functions.', order_index: 3 },
    ],
  });

  // --- Labs ---
  const [l1, l2, l3, l4, l5, l6, l7, l8, l9] = Array.from({ length: 9 }, () => randomUUID());

  await prisma.lab.createMany({
    data: [

      // ── Topic 1: Variables & Types ──────────────────────────────────────────

      {
        id: l1, topic_id: t1, order_index: 1,
        lab_type: 'javascript', lab_format: 'problem_solving',
        title: 'Hello, Variables',
        concept_md: [
          '## Variables in JavaScript',
          '',
          'Variables are named containers for storing data.',
          '',
          'Use `const` for values that will not change:',
          '',
          '```js',
          'const pi = 3.14;',
          '```',
          '',
          'Use `let` for values that may change:',
          '',
          '```js',
          'let score = 0;',
          'score = 10; // OK',
          '```',
          '',
          '### Primitive Types',
          '',
          '| Type    | Example          |',
          '|---------|------------------|',
          '| String  | `\'hello\'`       |',
          '| Number  | `42`, `3.14`     |',
          '| Boolean | `true`, `false`  |',
          '',
          '### Your Task',
          '',
          'Declare three variables:',
          '- `name` — a non-empty string',
          '- `age` — a positive number',
          '- `isStudent` — the boolean `true`',
        ].join('\n'),
        starter_code: [
          '// Declare your variables below',
          "const name = '';",
          'const age = 0;',
          'const isStudent = false;',
        ].join('\n'),
        solution_code: [
          "const name = 'Alice';",
          'const age = 20;',
          'const isStudent = true;',
        ].join('\n'),
      },

      {
        id: l2, topic_id: t1, order_index: 2,
        lab_type: 'javascript', lab_format: 'problem_solving',
        title: 'Type Conversion',
        concept_md: [
          '## Type Conversion',
          '',
          'JavaScript can convert between types explicitly.',
          '',
          '### To a Number',
          '',
          '```js',
          "Number('42')   // 42",
          "Number('')     // 0",
          "Number('abc')  // NaN",
          '```',
          '',
          '### To a String',
          '',
          '```js',
          "String(42)     // '42'",
          '```',
          '',
          '### To a Boolean',
          '',
          '```js',
          'Boolean(0)     // false  (falsy)',
          "Boolean('')    // false  (falsy)",
          'Boolean(null)  // false  (falsy)',
          'Boolean(1)     // true',
          "Boolean('hi')  // true",
          '```',
          '',
          '### Your Task',
          '',
          'Implement the three functions below.',
        ].join('\n'),
        starter_code: [
          'function toNumber(str) {',
          '  // Convert str to a number and return it',
          '}',
          '',
          'function toBoolean(value) {',
          '  // Convert value to a boolean and return it',
          '}',
          '',
          'function joinWithComma(a, b) {',
          '  // Return a string joining a and b with ", "',
          '  // e.g. joinWithComma(1, 2) => "1, 2"',
          '}',
        ].join('\n'),
        solution_code: [
          'function toNumber(str) {',
          '  return Number(str);',
          '}',
          '',
          'function toBoolean(value) {',
          '  return Boolean(value);',
          '}',
          '',
          'function joinWithComma(a, b) {',
          "  return String(a) + ', ' + String(b);",
          '}',
        ].join('\n'),
      },

      {
        id: l3, topic_id: t1, order_index: 3,
        lab_type: 'javascript', lab_format: 'fix_the_bug',
        title: 'Fix the Type Checker',
        concept_md: [
          '## Spot the Bug',
          '',
          "The function below should describe a value's type.",
          '',
          'Expected behaviour:',
          "- `describeType(42)` → `'number: 42'`",
          "- `describeType('hello')` → `'string: hello'`",
          "- `describeType(true)` → `'boolean: true'`",
          "- `describeType(null)` → `'null'`",
          '',
          'There are **two bugs** — find and fix them both.',
        ].join('\n'),
        starter_code: [
          'function describeType(value) {',
          '  if (value = null) {',
          "    return 'null';",
          '  }',
          '  const type = typeOf value;',
          "  return type + ': ' + value;",
          '}',
        ].join('\n'),
        solution_code: [
          'function describeType(value) {',
          '  if (value === null) {',
          "    return 'null';",
          '  }',
          '  const type = typeof value;',
          "  return type + ': ' + value;",
          '}',
        ].join('\n'),
      },

      // ── Topic 2: Arrays ─────────────────────────────────────────────────────

      {
        id: l4, topic_id: t2, order_index: 1,
        lab_type: 'javascript', lab_format: 'problem_solving',
        title: 'Working with Arrays',
        concept_md: [
          '## Arrays',
          '',
          'Arrays are ordered lists of values.',
          '',
          '```js',
          "const fruits = ['apple', 'banana', 'cherry'];",
          'fruits[0]            // \'apple\'',
          'fruits.length        // 3',
          "fruits.push('date')  // adds to end, returns new length",
          'fruits.pop()         // removes last element, returns it',
          '```',
          '',
          '### Your Task',
          '',
          'Implement the three functions below.',
        ].join('\n'),
        starter_code: [
          'function getFirst(arr) {',
          '  // Return the first element of arr',
          '}',
          '',
          'function getLast(arr) {',
          '  // Return the last element of arr',
          '}',
          '',
          'function addToEnd(arr, item) {',
          '  // Add item to arr and return the new length',
          '}',
        ].join('\n'),
        solution_code: [
          'function getFirst(arr) {',
          '  return arr[0];',
          '}',
          '',
          'function getLast(arr) {',
          '  return arr[arr.length - 1];',
          '}',
          '',
          'function addToEnd(arr, item) {',
          '  return arr.push(item);',
          '}',
        ].join('\n'),
      },

      {
        id: l5, topic_id: t2, order_index: 2,
        lab_type: 'javascript', lab_format: 'problem_solving',
        title: 'map and filter',
        concept_md: [
          '## Array Methods: map and filter',
          '',
          '### map',
          '',
          'Transforms every element and returns a new array:',
          '',
          '```js',
          '[1, 2, 3].map(n => n * 2)            // [2, 4, 6]',
          "['a', 'b'].map(s => s.toUpperCase()) // ['A', 'B']",
          '```',
          '',
          '### filter',
          '',
          'Keeps only elements where the callback returns `true`:',
          '',
          '```js',
          '[1, 2, 3, 4].filter(n => n % 2 === 0) // [2, 4]',
          '```',
          '',
          '### Your Task',
          '',
          'Implement the three functions below using `map` and `filter`.',
        ].join('\n'),
        starter_code: [
          'function doubleAll(numbers) {',
          '  // Return a new array with each number doubled',
          '}',
          '',
          'function onlyPositive(numbers) {',
          '  // Return only numbers greater than 0',
          '}',
          '',
          'function getNames(people) {',
          "  // people = [{ name: 'Alice', age: 20 }, ...]",
          '  // Return an array of just the name strings',
          '}',
        ].join('\n'),
        solution_code: [
          'function doubleAll(numbers) {',
          '  return numbers.map(n => n * 2);',
          '}',
          '',
          'function onlyPositive(numbers) {',
          '  return numbers.filter(n => n > 0);',
          '}',
          '',
          'function getNames(people) {',
          '  return people.map(p => p.name);',
          '}',
        ].join('\n'),
      },

      {
        id: l6, topic_id: t2, order_index: 3,
        lab_type: 'javascript', lab_format: 'fix_the_bug',
        title: 'Fix the Array Reducer',
        concept_md: [
          '## Spot the Bug',
          '',
          'The function below should sum all numbers in an array using `reduce`.',
          '',
          'Expected behaviour:',
          '- `sumArray([1, 2, 3, 4])` → `10`',
          '- `sumArray([])` → `0`',
          '- `sumArray([5])` → `5`',
          '',
          'Find and fix the bug.',
        ].join('\n'),
        starter_code: [
          'function sumArray(numbers) {',
          '  return numbers.reduce((total, n) => {',
          '    total + n;',
          '  }, 0);',
          '}',
        ].join('\n'),
        solution_code: [
          'function sumArray(numbers) {',
          '  return numbers.reduce((total, n) => total + n, 0);',
          '}',
        ].join('\n'),
      },

      // ── Topic 3: Functions ──────────────────────────────────────────────────

      {
        id: l7, topic_id: t3, order_index: 1,
        lab_type: 'javascript', lab_format: 'problem_solving',
        title: 'Writing Functions',
        concept_md: [
          '## Functions',
          '',
          'Functions are reusable blocks of code.',
          '',
          '```js',
          'function greet(name) {',
          "  return 'Hello, ' + name + '!';",
          '}',
          '',
          "greet('Alice') // 'Hello, Alice!'",
          '```',
          '',
          '### Parameters & Return Values',
          '',
          'A function can take any number of parameters. Use `return` to send a value back.',
          '',
          '```js',
          'function add(a, b) {',
          '  return a + b;',
          '}',
          '```',
          '',
          '### Your Task',
          '',
          'Implement the three functions below.',
        ].join('\n'),
        starter_code: [
          'function add(a, b) {',
          '  // Return the sum of a and b',
          '}',
          '',
          'function multiply(a, b) {',
          '  // Return the product of a and b',
          '}',
          '',
          'function isEven(n) {',
          '  // Return true if n is even, false otherwise',
          '}',
        ].join('\n'),
        solution_code: [
          'function add(a, b) {',
          '  return a + b;',
          '}',
          '',
          'function multiply(a, b) {',
          '  return a * b;',
          '}',
          '',
          'function isEven(n) {',
          '  return n % 2 === 0;',
          '}',
        ].join('\n'),
      },

      {
        id: l8, topic_id: t3, order_index: 2,
        lab_type: 'javascript', lab_format: 'problem_solving',
        title: 'Arrow Functions',
        concept_md: [
          '## Arrow Functions',
          '',
          'Arrow functions are a concise way to write functions.',
          '',
          '```js',
          '// Regular function',
          'function square(n) { return n * n; }',
          '',
          '// Equivalent arrow function',
          'const square = n => n * n;',
          '',
          '// Multiple params',
          'const add = (a, b) => a + b;',
          '',
          '// Multi-line body needs braces and an explicit return',
          'const process = (x) => {',
          '  const doubled = x * 2;',
          '  return doubled + 1;',
          '};',
          '```',
          '',
          '### Your Task',
          '',
          'Write each as an arrow function assigned to a `const`.',
        ].join('\n'),
        starter_code: [
          '// cube: takes n, returns n³',
          'const cube = null;',
          '',
          '// clamp: returns n kept within [min, max]',
          '// clamp(5,  1, 10) => 5',
          '// clamp(-1, 0, 10) => 0',
          '// clamp(15, 0, 10) => 10',
          'const clamp = null;',
          '',
          "// greet: takes a name, returns 'Hello, <name>!'",
          'const greet = null;',
        ].join('\n'),
        solution_code: [
          'const cube = n => n * n * n;',
          '',
          'const clamp = (n, min, max) => {',
          '  if (n < min) return min;',
          '  if (n > max) return max;',
          '  return n;',
          '};',
          '',
          "const greet = name => 'Hello, ' + name + '!';",
        ].join('\n'),
      },

      {
        id: l9, topic_id: t3, order_index: 3,
        lab_type: 'javascript', lab_format: 'fix_the_bug',
        title: 'Fix the Countdown',
        concept_md: [
          '## Spot the Bug',
          '',
          'The function below should count down from `n` to `1` and return an array.',
          '',
          'Expected behaviour:',
          '- `countDown(3)` → `[3, 2, 1]`',
          '- `countDown(1)` → `[1]`',
          '- `countDown(5)` → `[5, 4, 3, 2, 1]`',
          '',
          'There are **two bugs** — find and fix them both.',
        ].join('\n'),
        starter_code: [
          'function countDown(n) {',
          '  if (n = 0) {',
          '    return [];',
          '  }',
          '  return countDown(n - 1).concat(n);',
          '}',
        ].join('\n'),
        solution_code: [
          'function countDown(n) {',
          '  if (n <= 0) {',
          '    return [];',
          '  }',
          '  return [n].concat(countDown(n - 1));',
          '}',
        ].join('\n'),
      },

    ],
  });

  // --- Test Cases ---
  await prisma.testCase.createMany({
    data: [

      // l1 — Hello, Variables
      {
        lab_id: l1, order_index: 1,
        description: 'name is a non-empty string',
        test_code: "if (typeof name !== 'string' || name.trim() === '') throw new Error('name must be a non-empty string');",
      },
      {
        lab_id: l1, order_index: 2,
        description: 'age is a positive number',
        test_code: "if (typeof age !== 'number' || age <= 0) throw new Error('age must be a positive number');",
      },
      {
        lab_id: l1, order_index: 3,
        description: 'isStudent is true',
        test_code: "if (isStudent !== true) throw new Error('isStudent must be true');",
      },

      // l2 — Type Conversion
      {
        lab_id: l2, order_index: 1,
        description: "toNumber('42') returns 42",
        test_code: "var r = toNumber('42'); if (r !== 42) throw new Error('Expected 42, got ' + r);",
      },
      {
        lab_id: l2, order_index: 2,
        description: 'toBoolean handles falsy and truthy values',
        test_code: "if (toBoolean(0) !== false) throw new Error('toBoolean(0) should be false'); if (toBoolean(1) !== true) throw new Error('toBoolean(1) should be true');",
      },
      {
        lab_id: l2, order_index: 3,
        description: "joinWithComma(1, 2) returns '1, 2'",
        test_code: "var r = joinWithComma(1, 2); if (r !== '1, 2') throw new Error(\"Expected '1, 2', got '\" + r + \"'\");",
      },

      // l3 — Fix the Type Checker
      {
        lab_id: l3, order_index: 1,
        description: "describeType(42) returns 'number: 42'",
        test_code: "var r = describeType(42); if (r !== 'number: 42') throw new Error(\"Expected 'number: 42', got '\" + r + \"'\");",
      },
      {
        lab_id: l3, order_index: 2,
        description: "describeType('hello') returns 'string: hello'",
        test_code: "var r = describeType('hello'); if (r !== 'string: hello') throw new Error(\"Expected 'string: hello', got '\" + r + \"'\");",
      },
      {
        lab_id: l3, order_index: 3,
        description: "describeType(null) returns 'null'",
        test_code: "var r = describeType(null); if (r !== 'null') throw new Error(\"Expected 'null', got '\" + r + \"'\");",
      },

      // l4 — Working with Arrays
      {
        lab_id: l4, order_index: 1,
        description: 'getFirst returns the first element',
        test_code: "if (getFirst([10, 20, 30]) !== 10) throw new Error('Expected 10'); if (getFirst(['a', 'b']) !== 'a') throw new Error(\"Expected 'a'\");",
      },
      {
        lab_id: l4, order_index: 2,
        description: 'getLast returns the last element',
        test_code: "if (getLast([10, 20, 30]) !== 30) throw new Error('Expected 30'); if (getLast(['x', 'y', 'z']) !== 'z') throw new Error(\"Expected 'z'\");",
      },
      {
        lab_id: l4, order_index: 3,
        description: 'addToEnd adds the item and returns the new length',
        test_code: "var arr = [1, 2, 3]; var len = addToEnd(arr, 4); if (len !== 4) throw new Error('Expected length 4, got ' + len); if (arr[3] !== 4) throw new Error('Item was not added to the array');",
      },

      // l5 — map and filter
      {
        lab_id: l5, order_index: 1,
        description: 'doubleAll doubles every element',
        test_code: "var r = doubleAll([1, 2, 3]); if (JSON.stringify(r) !== '[2,4,6]') throw new Error('Expected [2,4,6], got ' + JSON.stringify(r));",
      },
      {
        lab_id: l5, order_index: 2,
        description: 'onlyPositive removes non-positive numbers',
        test_code: "var r = onlyPositive([-2, 0, 1, 5, -1]); if (JSON.stringify(r) !== '[1,5]') throw new Error('Expected [1,5], got ' + JSON.stringify(r));",
      },
      {
        lab_id: l5, order_index: 3,
        description: 'getNames extracts the name from each object',
        test_code: "var r = getNames([{ name: 'Alice', age: 20 }, { name: 'Bob', age: 25 }]); if (JSON.stringify(r) !== '[\"Alice\",\"Bob\"]') throw new Error('Expected [Alice,Bob], got ' + JSON.stringify(r));",
      },

      // l6 — Fix the Array Reducer
      {
        lab_id: l6, order_index: 1,
        description: 'sumArray([1, 2, 3, 4]) returns 10',
        test_code: "var r = sumArray([1, 2, 3, 4]); if (r !== 10) throw new Error('Expected 10, got ' + r);",
      },
      {
        lab_id: l6, order_index: 2,
        description: 'sumArray([]) returns 0',
        test_code: "var r = sumArray([]); if (r !== 0) throw new Error('Expected 0, got ' + r);",
      },
      {
        lab_id: l6, order_index: 3,
        description: 'sumArray with one element returns that element',
        test_code: "var r = sumArray([42]); if (r !== 42) throw new Error('Expected 42, got ' + r);",
      },

      // l7 — Writing Functions
      {
        lab_id: l7, order_index: 1,
        description: 'add returns the correct sum',
        test_code: "if (add(2, 3) !== 5) throw new Error('add(2,3) should be 5'); if (add(-1, 1) !== 0) throw new Error('add(-1,1) should be 0');",
      },
      {
        lab_id: l7, order_index: 2,
        description: 'multiply returns the correct product',
        test_code: "if (multiply(3, 4) !== 12) throw new Error('multiply(3,4) should be 12'); if (multiply(5, 0) !== 0) throw new Error('multiply(5,0) should be 0');",
      },
      {
        lab_id: l7, order_index: 3,
        description: 'isEven returns correct booleans',
        test_code: "if (isEven(4) !== true) throw new Error('isEven(4) should be true'); if (isEven(7) !== false) throw new Error('isEven(7) should be false'); if (isEven(0) !== true) throw new Error('isEven(0) should be true');",
      },

      // l8 — Arrow Functions
      {
        lab_id: l8, order_index: 1,
        description: 'cube(3) returns 27',
        test_code: "if (cube(3) !== 27) throw new Error('cube(3) should be 27'); if (cube(2) !== 8) throw new Error('cube(2) should be 8');",
      },
      {
        lab_id: l8, order_index: 2,
        description: 'clamp keeps value within min/max bounds',
        test_code: "if (clamp(5, 1, 10) !== 5) throw new Error('clamp(5,1,10) should be 5'); if (clamp(-1, 0, 10) !== 0) throw new Error('clamp(-1,0,10) should be 0'); if (clamp(15, 0, 10) !== 10) throw new Error('clamp(15,0,10) should be 10');",
      },
      {
        lab_id: l8, order_index: 3,
        description: "greet('Alice') returns 'Hello, Alice!'",
        test_code: "if (greet('Alice') !== 'Hello, Alice!') throw new Error(\"greet('Alice') should be 'Hello, Alice!'\"); if (greet('World') !== 'Hello, World!') throw new Error(\"greet('World') should be 'Hello, World!'\");",
      },

      // l9 — Fix the Countdown
      {
        lab_id: l9, order_index: 1,
        description: 'countDown(3) returns [3, 2, 1]',
        test_code: "var r = countDown(3); if (JSON.stringify(r) !== '[3,2,1]') throw new Error('Expected [3,2,1], got ' + JSON.stringify(r));",
      },
      {
        lab_id: l9, order_index: 2,
        description: 'countDown(1) returns [1]',
        test_code: "var r = countDown(1); if (JSON.stringify(r) !== '[1]') throw new Error('Expected [1], got ' + JSON.stringify(r));",
      },
      {
        lab_id: l9, order_index: 3,
        description: 'countDown(5) has correct length and order',
        test_code: "var r = countDown(5); if (r.length !== 5) throw new Error('Expected length 5, got ' + r.length); if (r[0] !== 5) throw new Error('Expected first element 5, got ' + r[0]); if (r[4] !== 1) throw new Error('Expected last element 1, got ' + r[4]);",
      },

    ],
  });

  // --- Bootcamp Labs (all 9 assigned to Batch 1) ---
  await prisma.bootcampLab.createMany({
    data: [l1, l2, l3, l4, l5, l6, l7, l8, l9].map(labId => ({
      bootcamp_id: bootcampId,
      lab_id: labId,
      assigned_by: adminId,
    })),
  });

  console.log('Done.');
  console.log('  Users:       4  (admin, instructor, student1, student2)');
  console.log('  Bootcamp:    Batch 1');
  console.log('  Course:      JavaScript Fundamentals');
  console.log('  Topics:      3  (Variables & Types, Arrays, Functions)');
  console.log('  Labs:        9  (3 per topic — 2 problem_solving + 1 fix_the_bug)');
  console.log('  Test cases:  27 (3 per lab)');
  console.log('  Bootcamp labs assigned: 9');
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
