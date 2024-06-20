"use client";
import VideoChat from '@/components/video-component/video-chat';
import { X, Play, Pause, Video, VideoIcon, SatelliteDish } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const VideoComponent = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((error) => {
          console.error('Error al acceder a la cámara:', error);
        });
    }
  }, []);

  const handleXClick = () => {
    // Aquí puedes agregar la lógica para cerrar la pestaña o ventana abierta
    window.close(); // Ejemplo: cierra la pestaña actual
  };

  return (
    <div className='w-full flex flex-col'>
      <div className='w-full sticky top-0 z-50'>
        {/* Header */}
        <div className='flex justify-between bg-gray-primary p-3'>
          <div className='flex gap-3 items-center'>
            <div className='animate-pulse bg-gray-tertiary w-full h-full rounded-full' />
            <div className='flex flex-col'>
              <p>marcador</p>
            </div>
          </div>
          <div className='flex items-center gap-7 mr-5'>
            <SatelliteDish size={16} className='cursor-pointer'/>
            <X size={16} className='cursor-pointer' onClick={handleXClick} />
          </div>
        </div>
      </div>
      <div className="h-screen-3/4">
        <VideoChat />
      </div>
    </div>
  );
};

export default VideoComponent;


//Pendiente WebRTC api y WebTransport
//  cd whatsnews
//¿Cómo edito el código para que en el left-panel los mensaje sin leer tuvieran una message-circle-warning de lucide al tener mensajes nuevos sin leer?