import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import '../styles/style.css'; // Make sure to include your CSS styles in a separate file

const ToDoApp = () => {
  const [lightMode, setLightMode] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [hideCompleted, setHideCompleted] = useState(false);
  const [userImage, setUserImage] = useState(null);
  const [userId, setUserId] = useState(''); // Assuming userId is stored in state after login

  function setError(errorMessage) {
    console.error('Error:', errorMessage);
    // Handle error logic here
  }
  
  useEffect(() => {
    if (lightMode) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }

    // Retrieve user image from local storage
    const image = localStorage.getItem('userImage');
    setUserImage(image);

    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId); // Set userId state from localStorage
    }

    // Fetch tasks from server
    fetchTasks();
  }, [lightMode]);

  const fetchTasks = () => {
    if (userId) {
      axios.get(`http://localhost:5036/tasks/${userId}`)
        .then(response => setTasks(response.data))
        .catch(error => console.error('Error fetching tasks:', error));
    } else {
      console.error('userId is undefined or null');
    }
  };

  useEffect(() => {
    fetchTasks(); // Fetch tasks on component mount or when userId changes
  }, [userId]);

  const toggleLightMode = () => {
    setLightMode(!lightMode);
  };

  const toggleCompletion = (index) => {
    const updatedTasks = tasks.map((task, i) =>
      i === index ? { ...task, completed: !task.completed } : task
    );
    updateTasks(updatedTasks);
  };

  const deleteTask = (id) => {
    axios.delete(`http://localhost:5036/remove/${id}`)
      .then(() => {
        const updatedTasks = tasks.filter(task => task._id !== id);
        updateTasks(updatedTasks);
      })
      .catch((error) => {
        console.error('Error deleting task:', error);
      });
  };

  const updateTasks = (updatedTasks) => {
    setTasks(updatedTasks);
  };

  const addNewTask = (e) => {
  e.preventDefault();
  if (newTask.trim()) {
    const newTaskObj = { text: newTask.trim(), completed: false };

    axios.post(`http://localhost:5036/addtask/${userId}`, newTaskObj)
      .then((response) => {
        updateTasks([...tasks, response.data]);
        setNewTask('');
      })
      .catch((error) => {
        console.error('Error adding new task:', error);
        setError('Failed to add task. Please try again.'); // Set error message
      });
  } else {
    setError('Task cannot be empty.'); // Set error message for empty task
  }
};

  const toggleHideCompleted = () => {
    setHideCompleted(!hideCompleted);
  };

  return (
    <div className="container">
      <div className="header">
        <div className="header-title">
          <h1 className="text-3xl font-bold">TO DO APP</h1>
          <p>Stop Procrastinating, Start Organizing</p>
        </div>
        <div className="user-icon">
          <img
            src={lightMode ? 'Group2.png' : 'Group.png'}
            alt="Toggle Light Mode"
            onClick={toggleLightMode}
          />
          <img src={userImage || 'photo.png'} alt="Profile" className="ml-2 profile-image" />
        </div>
      </div>
      <hr className="hr-line" />
      <div className="tasks-container">
        <div className="hide-completed">
          <button
            onClick={toggleHideCompleted}
            className="hide-button bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center"
          >
            {hideCompleted ? (
              <>
                <FontAwesomeIcon icon={faEye} className="mr-2" />
                <span>Unhide Completed</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faEyeSlash} className="mr-2" />
                <span>Hide Completed</span>
              </>
            )}
          </button>
        </div>

        <div className="completion-message text-gray-500">
          {tasks.filter((task) => task.completed).length} Completed
        </div>
        {tasks.map((task, index) =>
          (!hideCompleted || !task.completed) && (
            <div className="task-item flex items-center mb-4" key={task._id}>
              <div
                className={`task-icon w-8 h-8 border border-gray-800 rounded-full cursor-pointer ${task.completed ? 'completed' : ''}`}
                onClick={() => toggleCompletion(index)}
              >
              </div>
              <h5 className={`ml-4 flex-1 ${task.completed ? 'completed-text' : ''}`}>
                {task.text}
              </h5>
              <div className="trashcan-container">
                <FontAwesomeIcon
                  icon={faTrashAlt}
                  className="delete-icon text-gray-500 cursor-pointer"
                  onClick={() => deleteTask(task._id)}
                />
              </div>
            </div>
          )
        )}
      </div>
      <div className="add-note flex items-center mt-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New Note"
          className="w-full max-w-md h-10 px-2 rounded-lg bg-gray-800 text-white mr-2"
        />
        <input
          type="submit"
          value="Add New Note"
          onClick={addNewTask}
          className="w-40 h-10 px-4 rounded-lg bg-white text-gray-800 hover:bg-gray-300 cursor-pointer"
        />
      </div>
      
    </div>
  );
};

export default ToDoApp;
