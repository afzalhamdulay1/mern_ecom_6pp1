import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {useSelector} from 'react-redux'
import Container from '../../Container/Container'


function Header() {
  const {isAuthenticated} = useSelector((state) => state.user)
  const navigate = useNavigate()

  const navItems = [
    {
      name: 'Home',
      slug: "/",
      active: true
    },
    {
      name: 'Products',
      slug: "/products",
      active: true
    },
    {
      name: 'Search',
      slug: "/search",
      active: true
    },
    {
      name: 'Cart',
      slug: "/cart",
      active: true
    },
    {
      name: 'Account',
      slug: "/account",
      active: true
    },
    {
      name: "Login",
      slug: "/login",
      active: !isAuthenticated,
  }
  ]


  return (
    <header className='py-3 shadow bg-red-400'>
      <Container>
      <nav className='flex'>
          <div className='mr-4'>
            <Link to='/'>
              {/* <Logo width='70px'   /> */}
              <h1>Ecomm</h1>

              </Link>
          </div>
          <ul className='flex ml-auto'>
            {navItems.map((item) => 
            item.active ? (
              <li key={item.name}>
                <NavLink
                // onClick={() => navigate(item.slug)}
                to={item.slug}
                className='inline-bock px-6 py-2 duration-200 hover:bg-blue-100 rounded-full headerLink'
                >{item.name}</NavLink>
              </li>
            ) : null
            )}
          </ul>
        </nav>
      </Container>
        
    </header>
  )
}

export default Header