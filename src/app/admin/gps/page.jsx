import React from 'react';

function Page() {
  return (
    <div className='p-5 flex flex-col items-start space-y-4 w-full h-screen'>
      <div className='w-full h-full'>
   
        <div className=' w-full h-full'>
          <iframe
            className='w-full h-full border-none'
            src="https://gps.yslootahtech.com"
            title="GPS"
          ></iframe>
        </div>
      </div>
    </div>
  );
}

export default Page;