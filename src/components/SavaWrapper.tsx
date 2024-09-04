import SavaPage from './SavaPage'

export default function Component() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-[100vw]">
      <img src="../src/assets/leaves.png" alt="leaves" className="absolute top-0 left-0 w-full h-full object-cover opacity-25 blur-sm" />
      <SavaPage />
    </div>
  )
}