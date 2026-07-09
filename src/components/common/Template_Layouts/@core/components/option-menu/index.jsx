'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

// MUI Imports
import Tooltip from '@mui/material/Tooltip'
import Box from '@mui/material/Box'
import Popper from '@mui/material/Popper'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'

// Third-party Imports
import classnames from 'classnames'
import { Icon } from '@iconify/react'

// Hook Imports
import { useSettings } from '../../hooks/useSettings'

const IconButtonWrapper = props => {
  // Props
  const { tooltipProps, children } = props

  return tooltipProps?.title ? <Tooltip {...tooltipProps}>{children}</Tooltip> : children
}

const MenuItemWrapper = ({ children, option }) => {
  if (option.href) {
    return (
      <Box component={Link} to={option.href} {...option.linkProps}>
        {children}
      </Box>
    )
  } else {
    return <>{children}</>
  }
}

const OptionMenu = props => {
  // Props
  const { tooltipProps, icon, iconClassName, options, leftAlignMenu, iconButtonProps } = props

  // States
  const [open, setOpen] = useState(false)

  // Refs
  const anchorRef = useRef(null)

  // Hooks
  const { settings } = useSettings()

  const handleToggle = () => {
    if (!open) {
      window.dispatchEvent(new CustomEvent('close-all-option-menus'))
    }
    setOpen(prevOpen => !prevOpen)
  }

  const handleClose = event => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return
    }

    setOpen(false)
  }

  useEffect(() => {
    const handleGlobalClose = () => setOpen(false)
    window.addEventListener('close-all-option-menus', handleGlobalClose)
    window.addEventListener('scroll', handleGlobalClose, true)
    return () => {
      window.removeEventListener('close-all-option-menus', handleGlobalClose)
      window.removeEventListener('scroll', handleGlobalClose, true)
    }
  }, [])

  return (
    <>
      <IconButtonWrapper tooltipProps={tooltipProps}>
        <IconButton ref={anchorRef} size='small' onClick={handleToggle} {...iconButtonProps} className={classnames(iconClassName, iconButtonProps?.className)}>
          {typeof icon === 'string' ? (
            <Icon icon={icon} className={iconClassName} />
          ) : icon ? (
            icon
          ) : (
            <Icon icon='ri:more-2-line' className={iconClassName} />
          )}
        </IconButton>
      </IconButtonWrapper>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement={leftAlignMenu ? 'bottom-start' : 'bottom-end'}
        transition
        sx={{ zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps}>
            <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList autoFocusItem={open}>
                  {options.map((option, index) => {
                    if (typeof option === 'string') {
                      return (
                        <MenuItem key={index} onClick={handleClose}>
                          {option}
                        </MenuItem>
                      )
                    } else if ('divider' in option) {
                      return option.divider && <Divider key={index} {...option.dividerProps} />
                    } else {
                      return (
                        <MenuItem
                          key={index}
                          {...option.menuItemProps}
                          {...(option.href && { className: 'p-0' })}
                          onClick={e => {
                            handleClose(e)
                            if (option.menuItemProps && option.menuItemProps.onClick) {
                              option.menuItemProps.onClick(e)
                            }
                          }}
                        >
                          <MenuItemWrapper option={option}>
                            {(typeof option.icon === 'string' ? <Icon icon={option.icon} /> : option.icon) || null}
                            {option.text}
                          </MenuItemWrapper>
                        </MenuItem>
                      )
                    }
                  })}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default OptionMenu
