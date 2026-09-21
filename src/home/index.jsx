import { useEffect, useState } from "react";
import styles from "./home.module.scss";
import http from "../utils/http";

function Home() {
    const [tasks, setTasks] = useState([]);
    const [data, setData] = useState([]);
    const [detailTask, setDetailTask] = useState(null);
    const [title, setTitle] = useState("");

    useEffect(() => {
        getTasks();
    }, []);

    const getTasks = async () => {
        try {
            const taskList = await http.get("/api/tasks");
            setTasks(taskList || []);
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        try {
            const newTask = await http.post("/api/tasks", {
                title: title,
            });
            setTasks((prev) => [...prev, newTask]);
            setTitle("");
        } catch (e) {
            console.error(e);
        }
    };

    const getDetailTask = async (id) => {
        try {
            const task = await http.get(`/api/tasks/${id}`);
            setDetailTask(task);
        } catch (e) {
            console.error(e);
        }
    };

    const getDelTask = async (id, e) => {
        e.stopPropagation();
        try {
            await http.del(`/api/tasks/${id}`);
            setTasks((prev) => prev.filter((task) => task.id !== id));
            if (detailTask?.id === id) {
                setDetailTask(null);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const comletedCount = tasks.filter((task) => task.isCompleted).length;

    const handleToggleTask = async (id, e) => {
        e.stopPropagation();
        const currentTask = tasks.find((task) => task.id === id);
        if (!currentTask) return;
        try {
            const updatedTask = await http.put(`/api/tasks/${id}`, {
                isCompleted: !currentTask.isCompleted,
            });
            setTasks((prev) =>
                prev.map((t) => (t.id === id ? updatedTask : t)),
            );
            setDetailTask((prev) => (prev?.id === id ? updatedTask : prev));
        } catch (e) {
            console.error(e);
        }
    };

    const handleEditTask = async (e) => {
        e.preventDefault();
        if (!detailTask) return;
        try {
            const updatedTask = await http.put(`/api/tasks/${detailTask.id}`, {
                title: detailTask.title,
                isCompleted: Boolean(
                    detailTask.isCompleted ?? detailTask.isComplete,
                ),
            });
            setTasks((prev) =>
                prev.map((t) => (t.id === detailTask.id ? updatedTask : t)),
            );
            setDetailTask(updatedTask);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const analyticsUrl =
                    "https://api-gateway.fullstack.edu.vn/api/analytics";
                const res = await http.get(
                    `/?url=${encodeURIComponent(analyticsUrl)}`,
                );
                if (res?.data) {
                    setData(res.data);
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchAnalytics();
    }, []);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Quản Lý Công Việc</h1>
                <p className={styles.subtitle}>
                    Ứng dụng Task Manager với React & Node.js API
                </p>
            </header>

            <form className={styles.taskForm} onSubmit={handleAddTask}>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="Nhập tên công việc mới..."
                    onChange={(e) => setTitle(e.target.value)}
                    value={title}
                />
                <button type="submit" className={styles.addButton}>
                    Thêm task
                </button>
            </form>

            {detailTask && (
                <div className={styles.detailCard}>
                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={() => setDetailTask(null)}
                        title="Đóng"
                    >
                        ✕
                    </button>
                    <h3>Chỉnh sửa công việc #{detailTask.id}</h3>

                    <form onSubmit={handleEditTask}>
                        <div className={styles.formGroup}>
                            <label>Tên công việc:</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={detailTask.title || ""}
                                onChange={(e) =>
                                    setDetailTask((prev) => ({
                                        ...prev,
                                        title: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className={styles.statusGroup}>
                            <input
                                type="checkbox"
                                className={styles.checkbox}
                                checked={
                                    !!(
                                        detailTask.isCompleted ??
                                        detailTask.isComplete
                                    )
                                }
                                onChange={(e) =>
                                    setDetailTask((prev) => ({
                                        ...prev,
                                        isCompleted: e.target.checked,
                                    }))
                                }
                            />
                            <span className={styles.statusText}>
                                {Boolean(
                                    detailTask.isCompleted ??
                                    detailTask.isComplete,
                                )
                                    ? "Đã hoàn thành"
                                    : "Chưa hoàn thành"}
                            </span>
                        </div>

                        <button type="submit" className={styles.addButton}>
                            Lưu cập nhật
                        </button>
                    </form>
                </div>
            )}

            <div className={styles.statsBar}>
                <span>
                    Đã hoàn thành:{" "}
                    <span className={styles.badge}>
                        {comletedCount} / {tasks?.length || 0}
                    </span>
                </span>
            </div>

            <ul className={styles.taskList}>
                {tasks?.map((task) => {
                    const isDone = Boolean(task.isCompleted ?? task.isComplete);
                    return (
                        <li
                            onClick={() => getDetailTask(task.id)}
                            key={task.id}
                            className={`${styles.taskItem} ${isDone ? styles.completed : ""}`}
                        >
                            <div className={styles.taskLeft}>
                                <input
                                    type="checkbox"
                                    className={styles.checkbox}
                                    checked={isDone}
                                    onChange={(e) =>
                                        handleToggleTask(task.id, e)
                                    }
                                />
                                <span className={styles.taskText}>
                                    {task.title}
                                </span>
                            </div>
                            <button
                                type="button"
                                className={styles.deleteButton}
                                title="Xóa"
                                onClick={(e) => getDelTask(task.id, e)}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line
                                        x1="10"
                                        y1="11"
                                        x2="10"
                                        y2="17"
                                    ></line>
                                    <line
                                        x1="14"
                                        y1="11"
                                        x2="14"
                                        y2="17"
                                    ></line>
                                </svg>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default Home;
