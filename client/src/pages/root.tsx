import { Container } from '@/components/container'
import { NavBar } from '@/components/navbar'
import { Outlet } from 'react-router-dom'

export const Root = () => {
  return (
    <>
      <NavBar />
      <Container>
        <Outlet />
      </Container>
    </>
  )
}
