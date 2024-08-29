const fs = require('fs');
const path = require('path');

// join the files
const TASK_FILE = path.join(process.cwd(), 'task.txt');
const COMPLETED_FILE = path.join(process.cwd(), 'completed.txt');

if (!fs.existsSync(TASK_FILE)) fs.writeFileSync(TASK_FILE, '');
if (!fs.existsSync(COMPLETED_FILE)) fs.writeFileSync(COMPLETED_FILE, '');

// default for help

const showUsage = () => {
  console.log(`Usage :-
$ ./task add 2 hello world    # Add a new item with priority 2 and text "hello world" to the list
$ ./task ls                   # Show incomplete priority list items sorted by priority in ascending order
$ ./task del INDEX            # Delete the incomplete item with the given index
$ ./task done INDEX           # Mark the incomplete item with the given index as complete
$ ./task help                 # Show usage
$ ./task report               # Statistics`);
};


// read the tasks
const readTasks = () => {
  return fs.readFileSync(TASK_FILE, 'utf-8')
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [priority, ...taskArr] = line.split(' ');
      return { priority: parseInt(priority), task: taskArr.join(' ') };
    });
};

// write the tasks
// in task.test
const writeTasks = (tasks) => {
  const data = tasks.map(({ priority, task }) => `${priority} ${task}`).join('\n');
  fs.writeFileSync(TASK_FILE, data + '\n');
};

// read completed tasks
const readCompletedTasks = () => {
  return fs.readFileSync(COMPLETED_FILE, 'utf-8').split('\n').filter(Boolean);
};

// write in complted.txt
const writeCompletedTasks = (completed) => {
  fs.writeFileSync(COMPLETED_FILE, completed.join('\n') + '\n');
};
// add tasks
const addTask = (priority, task) => {
  const tasks = readTasks();
  tasks.push({ priority, task });
  tasks.sort((a, b) => a.priority - b.priority);
  writeTasks(tasks);
  console.log(`Added task: "${task}" with priority ${priority}`);
};
// list tasks
const listTasks = () => {
  const tasks = readTasks();
  if (tasks.length === 0) {
    console.log('There are no pending tasks!');
  } else {
    tasks.forEach(({ priority, task }, index) => {
      console.log(`${index + 1}. ${task} [${priority}]`);
    });
  }
};
// delete tasks
const deleteTask = (index) => {
  const tasks = readTasks();
  if (index < 1 || index > tasks.length) {
    console.log(`Error: task with index #${index} does not exist. Nothing deleted.`);
    return;
  }
  tasks.splice(index - 1, 1);
  writeTasks(tasks);
  console.log(`Deleted task #${index}`);
};
// mark as done
const markTaskAsDone = (index) => {
  const tasks = readTasks();
  if (index < 1 || index > tasks.length) {
    console.log(`Error: no incomplete item with index #${index} exists.`);
    return;
  }
  const [completedTask] = tasks.splice(index - 1, 1);
  writeTasks(tasks);
  const completed = readCompletedTasks();
  completed.push(completedTask.task);
  writeCompletedTasks(completed);
  console.log('Marked item as done.');
};
// display report
const report = () => {
  const tasks = readTasks();
  const completed = readCompletedTasks();
  console.log(`Pending : ${tasks.length}`);
  tasks.forEach(({ priority, task }, index) => {
    console.log(`${index + 1}. ${task} [${priority}]`);
  });
  console.log(`\nCompleted : ${completed.length}`);
  completed.forEach((task, index) => {
    console.log(`${index + 1}. ${task}`);
  });
};

const [command, ...args] = process.argv.slice(2);

switch (command) {
  case 'report':
    report();
    break;
  case 'help':
  default:
    showUsage();
    break;
    case 'ls':
      listTasks();
      break;
  case 'add':
    if (args.length < 2) {
      console.log('Error: Missing tasks string. Nothing added!');
    } else {
      const [priority, ...taskArr] = args;
      addTask(parseInt(priority), taskArr.join(' '));
    }
    break;
  case 'del':
    if (args.length === 0) {
      console.log('Error: Missing NUMBER for deleting tasks.');
    } else {
      deleteTask(parseInt(args[0]));
    }
    break;
  case 'done':
    if (args.length === 0) {
      console.log('Error: Missing NUMBER for marking tasks as done.');
    } else {
      markTaskAsDone(parseInt(args[0]));
    }
    break;
}
