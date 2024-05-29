"use client"

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const TaskPage = () => {
   const tasks = useQuery(api.tasks.getTasks)
   const deleteTask = useMutation(api.tasks.deleteTask)

  return (
    <div className='p-10 flex flex-col gap-4'>
        <h1 className='text-5x1'>Todas estas tareas son en tiempo real</h1>
        {tasks?.map((task) =>(
            <div key={task._id} className='flex gap-2'>
                <span>{task.text}</span>
                <button
                onClick={async () => {
                    await deleteTask({ id: task._id});
                }}
            >delete Task</button>
                </div>
        ))}
        </div>
  )
}

export default TaskPage;