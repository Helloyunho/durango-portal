import Logo from '../assets/logo.svg'

export const Index = () => {
  return (
    <div className='m-auto flex flex-col items-center'>
      <img src={Logo} alt='logo' className='w-96 h-96' />
      <h1 className='font-semibold text-6xl'>Durango Portal</h1>
      <p className='text-2xl'>
        Packed with useful utils for Xbox One/Series consoles.
      </p>
    </div>
  )
}
