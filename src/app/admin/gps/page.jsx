import React from 'react';

function Page() {
  return (
    <div className='p-5 flex flex-col items-start space-y-4 w-full h-screen'>
      <div className='w-full h-full'>
        <p className="text-xl sm:text-2xl w-full text-left font-bold text-[#17a3d7]">
          GPS
        </p>
        <div className='mt-8 w-full h-full'>
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