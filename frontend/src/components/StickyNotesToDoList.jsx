import React, { useState, useEffect } from 'react';

const PASTEL_COLORS = [
  '#FFF9E6', '#FFE8B6', // Yellows
  '#FFE4F0', '#FFB3D9', // Pinks
  '#E3F2FD', '#B3E5FC', // Blues
  '#E8F5E9', '#C8E6C9', // Greens
  '#F3E5F5', '#E1BEE7', // Lavenders
  '#FFECB3', '#FFD699', // Peaches
];

const getRandomColor = () => PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];
// Generate a tiny random rotation between -3 and 3 degrees
const getRandomRotation = () => `${(Math.random() * 6 - 3).toFixed(1)}deg`;

const StickyNotesToDoList = () => {
  const [todos, setTodos] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null); 
  const [deleteType, setDeleteType] = useState(null); 
  const [completingTaskId, setCompletingTaskId] = useState(null);
  
  // Edit State
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskText, setEditTaskText] = useState('');

  // Load data
  useEffect(() => {
    try {
      const storedTodos = localStorage.getItem('stickyNotes_todos');
      const storedCompleted = localStorage.getItem('stickyNotes_completed');
      
      if (storedTodos) setTodos(JSON.parse(storedTodos));
      if (storedCompleted) setCompletedTasks(JSON.parse(storedCompleted));
    } catch (error) {
      console.error('Error loading data from localStorage', error);
    }
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem('stickyNotes_todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('stickyNotes_completed', JSON.stringify(completedTasks));
  }, [completedTasks]);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask = {
      id: Date.now().toString(),
      text: newTaskText,
      createdAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      color: getRandomColor(),
      rotation: getRandomRotation(),
    };

    setTodos([newTask, ...todos]);
    setNewTaskText('');
  };

  const handleCompleteTask = (task) => {
    setCompletingTaskId(task.id);
    
    setTimeout(() => {
      setTodos((prev) => prev.filter((t) => t.id !== task.id));
      setCompletedTasks((prev) => [{ 
        ...task, 
        completedAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) 
      }, ...prev]);
      setCompletingTaskId(null);
    }, 600);
  };

  const handleRestoreTask = (task) => {
    setCompletedTasks((prev) => prev.filter((t) => t.id !== task.id));
    setTodos((prev) => [{ ...task }, ...prev]);
  };

  const confirmDelete = (task, type) => {
    setTaskToDelete(task);
    setDeleteType(type);
  };

  const executeDelete = () => {
    if (deleteType === 'active') {
      setTodos((prev) => prev.filter((t) => t.id !== taskToDelete.id));
    } else if (deleteType === 'completed') {
      setCompletedTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
    }
    setTaskToDelete(null);
    setDeleteType(null);
  };

  const startEditTask = (task) => {
    setEditingTaskId(task.id);
    setEditTaskText(task.text);
  };

  const saveEditTask = (id) => {
    if (!editTaskText.trim()) return;
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, text: editTaskText } : t));
    setEditingTaskId(null);
  };

  const cancelEditTask = () => {
    setEditingTaskId(null);
    setEditTaskText('');
  };

  return (
    <div className="sn-wrapper">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Just+Another+Hand&display=swap');
        
        .sn-wrapper {
          min-height: calc(100vh - 64px);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #1e293b;
          background-color: #f8fafc;
          background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
          background-size: 24px 24px;
          padding-bottom: 64px;
        }
        
        .sn-container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 32px;
        }

        .sn-header {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #eff6ff, #f0fdfa);
          padding: 24px 32px;
          border-radius: 24px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
          border: 1px solid rgba(255,255,255,0.8);
          margin-bottom: 56px;
          flex-wrap: wrap; 
          gap: 24px;
        }

        .sn-title {
          font-size: 36px;
          font-weight: 700;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 12px;
          letter-spacing: -0.02em;
        }

        .sn-celebration-btn {
          background: linear-gradient(135deg, #a855f7, #3b82f6);
          color: white;
          padding: 14px 28px;
          border-radius: 999px;
          font-size: 18px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 4px 14px rgba(168,85,247,0.4);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .sn-celebration-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(168,85,247,0.5);
        }

        .sn-badge {
          background: white;
          color: #9333ea;
          font-size: 14px;
          font-weight: 700;
          padding: 2px 10px;
          border-radius: 999px;
          margin-left: 8px;
        }

        .sn-form {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          gap: 32px; 
          max-width: 900px;
          margin: 0 auto 64px auto;
          flex-wrap: wrap;
        }

        .sn-input-container {
          flex: 1;
          min-width: 300px;
        }

        .sn-input {
          width: 100%;
          padding: 18px 24px;
          border-radius: 999px;
          font-size: 18px;
          font-family: inherit;
          border: 1px solid #cbd5e1;
          box-shadow: 0 4px 6px rgba(0,0,0,0.02);
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
        }
        .sn-input:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 4px rgba(96,165,250,0.15);
        }

        .sn-add-btn {
          background: linear-gradient(135deg, #a855f7, #3b82f6);
          color: white;
          padding: 18px 36px;
          border-radius: 999px;
          font-size: 18px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(168,85,247,0.4);
          transition: all 0.2s;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sn-add-btn:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 6px 20px rgba(168,85,247,0.5);
        }
        .sn-add-btn:disabled {
          background: #cbd5e1;
          box-shadow: none;
          cursor: not-allowed;
          color: #94a3b8;
        }

        .sn-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 48px; 
          justify-content: center;
          align-items: flex-start;
        }

        .sn-card {
          width: 320px;
          min-height: 280px; 
          height: auto; 
          flex-shrink: 0;
          padding: 24px;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          position: relative;
          box-sizing: border-box;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.08); 
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s;
        }
        
        .sn-card:hover {
          box-shadow: 0 16px 32px rgba(0,0,0,0.12);
          z-index: 10;
        }

        .sn-checkbox {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 2px solid #cbd5e1;
          background: rgba(255,255,255,0.6);
          cursor: pointer;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          margin-top: 6px;
        }
        .sn-checkbox:hover {
          border-color: #4ade80;
        }
        .sn-checkbox-checking {
          background: #dcfce3;
          border-color: #dcfce3;
          color: #16a34a;
        }

        .sn-handwritten {
          font-family: "Just Another Hand", cursive;
          font-size: 48px;
          line-height: 0.95;
          letter-spacing: 0.5px;
          color: #1e293b;
          margin: 0;
          padding-top: 3px;
          word-break: break-word;
          transition: all 0.3s;
        }
        
        .sn-textarea {
          width: 100%;
          background: rgba(255,255,255,0.5);
          border: 1px dashed #cbd5e1;
          border-radius: 8px;
          padding: 8px;
          outline: none;
          resize: none;
          box-sizing: border-box;
        }
        .sn-textarea:focus {
          border-color: #3b82f6;
          background: #ffffff;
        }

        .sn-edit-action {
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          padding: 5px 12px;
          border-radius: 999px;
          cursor: pointer;
          border: none;
          transition: background 0.2s;
        }
        .sn-edit-action.cancel { background: #f1f5f9; color: #64748b; }
        .sn-edit-action.cancel:hover { background: #e2e8f0; }
        .sn-edit-action.save { background: #3b82f6; color: white; }
        .sn-edit-action.save:hover { background: #2563eb; }

        .sn-timestamp {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          flex-shrink: 0;
        }

        /* Animation for completing a task */
        .sn-completing {
          animation: complete-task 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes complete-task {
          0% { opacity: 1; transform: scale(1) var(--rotation); }
          30% { opacity: 0.8; transform: scale(0.95) var(--rotation); }
          100% { opacity: 0; transform: scale(0.8) translateY(30px) var(--rotation); }
        }

        /* Modal Overlays */
        .sn-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 24px;
          animation: fade-in 0.2s ease-out;
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        .sn-modal {
          background: white;
          width: 100%;
          max-width: 900px;
          max-height: 85vh;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(20px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        .sn-modal-header {
          padding: 24px 32px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8fafc;
          border-top-left-radius: 24px;
          border-top-right-radius: 24px;
        }
        .sn-modal-title {
          font-size: 28px;
          font-weight: 700;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sn-close-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: transparent;
          font-size: 20px;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .sn-close-btn:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        .sn-modal-body {
          padding: 32px;
          overflow-y: auto;
          flex-grow: 1;
        }

        .sn-completed-card {
          background: #ffffff;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          border: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .sn-completed-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }

        .sn-completed-actions {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(0,0,0,0.05);
        }
        .sn-action-btn {
          background: transparent;
          border: none;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .sn-action-btn.edit { opacity: 0.6; filter: grayscale(1); }
        .sn-action-btn.edit:hover { opacity: 1; filter: none; background: #f1f5f9; }
        .sn-action-btn.restore { color: #3b82f6; }
        .sn-action-btn.restore:hover { background: #eff6ff; }
        .sn-action-btn.delete { color: #94a3b8; }
        .sn-action-btn.delete:hover { color: #ef4444; background: #fef2f2; }

      `}} />

      <div className="sn-container">
        
        {/* Header Section */}
        <div className="sn-header">
          <h1 className="sn-title">
            <span>📌</span> My Sticky Notes
          </h1>
          
          <button onClick={() => setIsCelebrationOpen(true)} className="sn-celebration-btn">
            <span>🎉</span>
            Celebration Folder
            {completedTasks.length > 0 && (
              <span className="sn-badge">{completedTasks.length}</span>
            )}
          </button>
        </div>

        {/* Input Form Section */}
        <form onSubmit={handleAddTask} className="sn-form">
          <div className="sn-input-container">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Jot down a new task... ✨"
              className="sn-input"
            />
          </div>
          <button type="submit" disabled={!newTaskText.trim()} className="sn-add-btn">
            <span style={{fontSize:'20px', fontWeight:'400'}}>+</span> Add Task
          </button>
        </form>

        {/* Notes Grid Display */}
        <div className="sn-grid">
          {todos.length === 0 ? (
            <div style={{textAlign: 'center', margin: '64px 0', opacity: 0.6}}>
              <span style={{fontSize: '64px', display: 'block', marginBottom: '16px'}}>🍃</span>
              <p style={{fontSize: '20px', color: '#64748b'}}>Your board is empty. Add a task to get started!</p>
            </div>
          ) : (
            todos.map((task) => {
              const isCompleting = completingTaskId === task.id;
              const isEditing = editingTaskId === task.id;
              
              return (
                <div 
                  key={task.id}
                  className={`sn-card ${isCompleting ? 'sn-completing' : ''}`}
                  style={{
                    backgroundColor: task.color,
                    '--rotation': task.rotation,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = `rotate(0deg) scale(1.03) translateY(-5px)`}
                  onMouseLeave={(e) => e.currentTarget.style.transform = `rotate(${task.rotation}) scale(1) translateY(0)`}
                  ref={el => { if(el && !isCompleting && el.style.transform === "") el.style.transform = `rotate(${task.rotation})`; }}
                >
                  <div style={{display:'flex', gap:'16px', alignItems:'flex-start', flexGrow: 1}}>
                    <button 
                      onClick={() => !isEditing && handleCompleteTask(task)}
                      className={`sn-checkbox ${isCompleting ? 'sn-checkbox-checking' : ''}`}
                      title="Mark as done"
                      disabled={isEditing}
                      style={{ opacity: isEditing ? 0.5 : 1 }}
                    >
                      {isCompleting && <span style={{fontSize:'12px', fontWeight:'bold'}}>✓</span>}
                    </button>
                    
                    {isEditing ? (
                      <div style={{flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '12px'}}>
                        <textarea
                          autoFocus
                          value={editTaskText}
                          onChange={(e) => setEditTaskText(e.target.value)}
                          className="sn-handwritten sn-textarea"
                          rows={3}
                        />
                        <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
                          <button onClick={cancelEditTask} className="sn-edit-action cancel">Cancel</button>
                          <button onClick={() => saveEditTask(task.id)} className="sn-edit-action save">Save</button>
                        </div>
                      </div>
                    ) : (
                      <p className="sn-handwritten" style={{ textDecoration: isCompleting ? 'line-through' : 'none', color: isCompleting ? '#94a3b8' : '#1e293b' }}>
                        {task.text}
                      </p>
                    )}
                  </div>

                  <div className="sn-completed-actions" style={{marginTop:'24px'}}>
                    <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
                       <span className="sn-timestamp" style={{border:'none', margin:0, padding:0}}>CREATED: {task.createdAt}</span>
                    </div>
                    {!isEditing && (
                      <div style={{display:'flex', gap:'4px'}}>
                        <button onClick={() => startEditTask(task)} className="sn-action-btn edit" title="Edit text">✏️</button>
                        <button onClick={() => confirmDelete(task, 'active')} className="sn-action-btn delete" title="Delete">🗑️</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Celebration Folder Modal */}
      {isCelebrationOpen && (
        <div className="sn-modal-overlay">
          <div className="sn-modal">
            <div className="sn-modal-header">
              <h2 className="sn-modal-title"><span>🌟</span> Celebration Folder</h2>
              <button onClick={() => setIsCelebrationOpen(false)} className="sn-close-btn">✕</button>
            </div>
            
            <div className="sn-modal-body">
              {completedTasks.length === 0 ? (
                <div style={{textAlign:'center', padding:'64px 0', opacity:'0.6'}}>
                  <span style={{fontSize:'64px', display:'block', marginBottom:'16px', filter:'grayscale(1)'}}>🏆</span>
                  <p style={{fontSize:'18px', color:'#64748b'}}>No completed tasks yet. Keep going!</p>
                </div>
              ) : (
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'24px'}}>
                  {completedTasks.map(task => (
                    <div key={task.id} className="sn-completed-card">
                      <div style={{display:'flex', gap:'16px', alignItems:'flex-start'}}>
                        <div style={{width:'26px', height:'26px', borderRadius:'50%', background:'#dcfce3', color:'#16a34a', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:'0', marginTop:'6px'}}>
                          <span style={{fontSize:'12px', fontWeight:'bold'}}>✓</span>
                        </div>
                        <p className="sn-handwritten" style={{textDecoration:'line-through', color:'#64748b', margin:0}}>
                          {task.text}
                        </p>
                      </div>
                      <div className="sn-completed-actions" style={{marginTop:'24px'}}>
                        <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
                           <span className="sn-timestamp" style={{border:'none', margin:0, padding:0}}>CREATED: {task.createdAt}</span>
                           <span className="sn-timestamp" style={{border:'none', margin:0, padding:0, color:'#3b82f6'}}>FINISHED: {task.completedAt}</span>
                        </div>
                        <div style={{display:'flex', gap:'4px'}}>
                          <button onClick={() => handleRestoreTask(task)} className="sn-action-btn restore" title="Restore">↻</button>
                          <button onClick={() => confirmDelete(task, 'completed')} className="sn-action-btn delete" title="Delete permanently">🗑️</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="sn-modal-overlay" style={{zIndex: 200}}>
          <div className="sn-modal" style={{maxWidth: '400px', padding: '32px', textAlign: 'center'}}>
            <span style={{fontSize:'56px', marginBottom:'16px', display:'block'}}>⚠️</span>
            <h3 style={{fontSize:'24px', margin:'0 0 16px 0', color:'#1e293b'}}>Delete Task?</h3>
            <p style={{color:'#64748b', marginBottom:'32px'}}>
              Are you sure you want to throw this away permanently?
            </p>
            <div style={{display:'flex', gap:'16px'}}>
              <button 
                onClick={() => { setTaskToDelete(null); setDeleteType(null); }}
                style={{flex:1, padding:'12px', borderRadius:'8px', border:'none', background:'#f1f5f9', color:'#475569', fontWeight:'600', cursor:'pointer'}}
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                style={{flex:1, padding:'12px', borderRadius:'8px', border:'none', background:'#ef4444', color:'white', fontWeight:'600', cursor:'pointer'}}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StickyNotesToDoList;
