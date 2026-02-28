'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'

const ANIMATION_PARAMS = {
  'Card Flip': { duration: 800 },
  'Reveal Open': { delay: 850, duration: 480 },
  'Reveal Close': { delay: 0, duration: 600 },
  'Button Fade Open': { delay: 900, duration: 1000 },
  'Button Fade Close': { delay: 0, duration: 245 },
  loadingDelay: 1300,
}

const IDLE_SWEEP_DEFAULTS = {
  delay: 6000,
  duration: 1300,
  initialDelay: 1800,
}

const IDLE_SWEEP_BEAM = {
  width: 60,
  angle: 30,
  peakOpacity: 0.24,
}

const IDLE_SWEEP_EASING = [0, 0, 1, 1] as const

const footerLinks = [
  'مركز المساعدة',
  'شروط الاستخدام',
  'سياسة الخصوصية',
  'التواصل',
  'عن ثمانية',
]

const socialLinks = [
  { name: 'Facebook', icon: '/assets/figma/icon-facebook.svg' },
  { name: 'Instagram', icon: '/assets/figma/icon-instagram.svg' },
  { name: 'X', icon: '/assets/figma/icon-x.svg' },
  { name: 'YouTube', icon: '/assets/figma/icon-youtube.svg' },
]

export default function HomePage() {
  const [voucherCode, setVoucherCode] = useState('')
  const [verificationState, setVerificationState] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [resolvedCode, setResolvedCode] = useState('')
  const [isCardHovered, setIsCardHovered] = useState(false)
  const [isCardParallax, setIsCardParallax] = useState(false)
  const [isGyroActive, setIsGyroActive] = useState(false)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [isIdleSweepActive, setIsIdleSweepActive] = useState(false)
  const trimmedCode = voucherCode.trim()
  const successSoundRef = useRef<HTMLAudioElement | null>(null)
  const errorSoundRef = useRef<HTMLAudioElement | null>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const cardSceneRef = useRef<HTMLDivElement>(null)
  const activateGyroRef = useRef<(() => void) | null>(null)
  const idleSweepStartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idleSweepEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isIdleSweepSuppressedRef = useRef(false)
  const prefersReducedMotionRef = useRef(false)
  const scheduleIdleSweepRef = useRef<(delay: number) => void>(() => {})
  const idleSweepConfigRef = useRef(IDLE_SWEEP_DEFAULTS)
  const idleSweepDelay = IDLE_SWEEP_DEFAULTS.delay
  const idleSweepDuration = IDLE_SWEEP_DEFAULTS.duration
  const idleSweepBeamWidth = IDLE_SWEEP_BEAM.width
  const idleSweepBeamAngle = IDLE_SWEEP_BEAM.angle
  const idleSweepPeakOpacity = IDLE_SWEEP_BEAM.peakOpacity
  const idleSweepSoftOpacity = idleSweepPeakOpacity * 0.5
  const idleSweepFadeOpacity = idleSweepPeakOpacity * 0.24
  const idleSweepEdgeOffset = Math.max(idleSweepBeamWidth * 0.78, 18)
  const [
    idleSweepEaseX1,
    idleSweepEaseY1,
    idleSweepEaseX2,
    idleSweepEaseY2,
  ] = IDLE_SWEEP_EASING
  const cardSceneStyle = {
    transformStyle: 'preserve-3d',
    '--idle-sweep-duration': `${idleSweepDuration}ms`,
    '--idle-sweep-width': `${idleSweepBeamWidth}%`,
    '--idle-sweep-left': `-${idleSweepEdgeOffset}%`,
    '--idle-sweep-angle': `${idleSweepBeamAngle}deg`,
    '--idle-sweep-peak-opacity': idleSweepPeakOpacity.toFixed(3),
    '--idle-sweep-soft-opacity': idleSweepSoftOpacity.toFixed(3),
    '--idle-sweep-fade-opacity': idleSweepFadeOpacity.toFixed(3),
    '--idle-sweep-ease-x1': idleSweepEaseX1.toFixed(3),
    '--idle-sweep-ease-y1': idleSweepEaseY1.toFixed(3),
    '--idle-sweep-ease-x2': idleSweepEaseX2.toFixed(3),
    '--idle-sweep-ease-y2': idleSweepEaseY2.toFixed(3),
  } as CSSProperties

  idleSweepConfigRef.current = {
    delay: idleSweepDelay,
    duration: idleSweepDuration,
    initialDelay: IDLE_SWEEP_DEFAULTS.initialDelay,
  }

  useEffect(() => {
    successSoundRef.current = new Audio('/assets/figma/sr-sequence.mp3')
    errorSoundRef.current = new Audio('/assets/figma/error.wav')
  }, [])

  // ── Animation params (static) ─────────────────────────────────────────────
  const p = ANIMATION_PARAMS

  // ── Write CSS vars on mount ───────────────────────────────────────────────
  useEffect(() => {
    const el = pageRef.current
    if (!el) return
    el.style.setProperty('--flip-duration', `${p['Card Flip'].duration}ms`)
    el.style.setProperty('--reveal-open-delay', `${p['Reveal Open'].delay}ms`)
    el.style.setProperty('--reveal-open-duration', `${p['Reveal Open'].duration}ms`)
    el.style.setProperty('--reveal-close-delay', `${p['Reveal Close'].delay}ms`)
    el.style.setProperty('--reveal-close-duration', `${p['Reveal Close'].duration}ms`)
    el.style.setProperty('--btn-fade-open-delay', `${p['Button Fade Open'].delay}ms`)
    el.style.setProperty('--btn-fade-open-duration', `${p['Button Fade Open'].duration}ms`)
    el.style.setProperty('--btn-fade-close-delay', `${p['Button Fade Close'].delay}ms`)
    el.style.setProperty('--btn-fade-close-duration', `${p['Button Fade Close'].duration}ms`)
  }, [])

  useEffect(() => {
    const scene = cardSceneRef.current
    if (!scene) return
    if (typeof window === 'undefined') return
    if (!window.matchMedia('(hover: none) and (pointer: coarse)').matches) return
    if (!('DeviceOrientationEvent' in window)) return

    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
    const maxTilt = 24
    let isListening = false

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma == null || event.beta == null) return
      const ratioX = 0.5 + clamp(event.gamma, -maxTilt, maxTilt) / (maxTilt * 2)
      const ratioY = 0.5 + clamp(event.beta, -maxTilt, maxTilt) / (maxTilt * 2)
      scene.style.setProperty('--ratio-x', ratioX.toFixed(4))
      scene.style.setProperty('--ratio-y', ratioY.toFixed(4))
      setIsGyroActive(true)
      setIsCardParallax(true)
    }

    const startListening = () => {
      if (isListening) return
      window.addEventListener('deviceorientation', handleOrientation, true)
      window.addEventListener('deviceorientationabsolute', handleOrientation as EventListener, true)
      isListening = true
    }

    const requestPermission = async () => {
      const orientationEvent = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<'granted' | 'denied'>
      }
      if (typeof orientationEvent.requestPermission !== 'function') {
        startListening()
        return
      }
      try {
        const permission = await orientationEvent.requestPermission()
        if (permission === 'granted') {
          startListening()
        }
      } catch {
        // no-op: permission denied or unavailable
      }
    }

    activateGyroRef.current = () => {
      void requestPermission()
    }
    window.addEventListener('touchstart', activateGyroRef.current, { passive: true })

    return () => {
      if (isListening) {
        window.removeEventListener('deviceorientation', handleOrientation, true)
        window.removeEventListener('deviceorientationabsolute', handleOrientation as EventListener, true)
      }
      if (activateGyroRef.current) {
        window.removeEventListener('touchstart', activateGyroRef.current)
      }
      activateGyroRef.current = null
      setIsGyroActive(false)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const clearIdleSweepStartTimeout = () => {
      if (idleSweepStartTimeoutRef.current) {
        clearTimeout(idleSweepStartTimeoutRef.current)
        idleSweepStartTimeoutRef.current = null
      }
    }
    const clearIdleSweepEndTimeout = () => {
      if (idleSweepEndTimeoutRef.current) {
        clearTimeout(idleSweepEndTimeoutRef.current)
        idleSweepEndTimeoutRef.current = null
      }
    }
    const stopIdleSweep = () => {
      clearIdleSweepStartTimeout()
      clearIdleSweepEndTimeout()
      setIsIdleSweepActive(false)
    }
    const scheduleIdleSweep = (delay: number) => {
      clearIdleSweepStartTimeout()
      if (prefersReducedMotionRef.current || isIdleSweepSuppressedRef.current) return

      idleSweepStartTimeoutRef.current = setTimeout(() => {
        idleSweepStartTimeoutRef.current = null
        if (prefersReducedMotionRef.current || isIdleSweepSuppressedRef.current) return

        setIsIdleSweepActive(true)
        clearIdleSweepEndTimeout()
        idleSweepEndTimeoutRef.current = setTimeout(() => {
          idleSweepEndTimeoutRef.current = null
          setIsIdleSweepActive(false)
          if (!prefersReducedMotionRef.current && !isIdleSweepSuppressedRef.current) {
            scheduleIdleSweep(idleSweepConfigRef.current.delay)
          }
        }, idleSweepConfigRef.current.duration)
      }, delay)
    }
    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = event.matches
      if (event.matches) {
        stopIdleSweep()
        return
      }
      scheduleIdleSweep(idleSweepConfigRef.current.delay)
    }

    prefersReducedMotionRef.current = reduceMotionQuery.matches
    scheduleIdleSweepRef.current = scheduleIdleSweep
    if (!prefersReducedMotionRef.current) {
      scheduleIdleSweep(idleSweepConfigRef.current.initialDelay)
    }
    reduceMotionQuery.addEventListener('change', handleReducedMotionChange)

    return () => {
      reduceMotionQuery.removeEventListener('change', handleReducedMotionChange)
      scheduleIdleSweepRef.current = () => {}
      clearIdleSweepStartTimeout()
      clearIdleSweepEndTimeout()
    }
  }, [])

  const isLoading = verificationState === 'loading'
  const isSuccess = verificationState === 'success'
  const isError = verificationState === 'error'
  const isVerifyLocked = isSuccess && trimmedCode === resolvedCode
  const isCardTiltActive = isCardHovered || isGyroActive
  const isCardTiltParallax = isCardParallax || isGyroActive
  const hasTypedCode = trimmedCode.length > 0
  const isIdleSweepSuppressed = isCardTiltActive || isInputFocused || hasTypedCode || verificationState !== 'idle'

  const frontCardText =
    isLoading
      ? 'جاري التحقق'
      : isError
        ? 'انتهت صلاحية هذا الرمز'
        : trimmedCode

  useEffect(() => {
    isIdleSweepSuppressedRef.current = isIdleSweepSuppressed
    if (prefersReducedMotionRef.current) return

    if (isIdleSweepSuppressed) {
      if (!isIdleSweepActive && idleSweepStartTimeoutRef.current) {
        clearTimeout(idleSweepStartTimeoutRef.current)
        idleSweepStartTimeoutRef.current = null
      }
      return
    }

    if (isIdleSweepActive) return

    if (idleSweepStartTimeoutRef.current) {
      clearTimeout(idleSweepStartTimeoutRef.current)
      idleSweepStartTimeoutRef.current = null
    }

    scheduleIdleSweepRef.current(idleSweepDelay)
  }, [idleSweepDelay, isIdleSweepActive, isIdleSweepSuppressed])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (verificationState === 'loading') return
    if (!trimmedCode) { setVerificationState('idle'); return }
    if (verificationState === 'success' && trimmedCode === resolvedCode) return

    setVerificationState('loading')
    const currentCode = trimmedCode

    setTimeout(() => {
      if (currentCode === 'AA123') {
        setVerificationState('error')
        setResolvedCode(currentCode)
        if (errorSoundRef.current) {
          errorSoundRef.current.currentTime = 0
          errorSoundRef.current.play().catch(() => {})
        }
        return
      }
      setVerificationState('success')
      setResolvedCode(currentCode)
      if (successSoundRef.current) {
        successSoundRef.current.currentTime = 0
        successSoundRef.current.play().catch(() => {})
      }
    }, p.loadingDelay)
  }

  return (
    <div ref={pageRef} className="gift-card-page" data-name="Home" data-node-id="4237:47628">
      <section className="hero-section" data-name="Hero section" data-node-id="4237:47629">
        <header className="navigation-bar" data-name="Navaigation" data-node-id="4237:47643">
          <div className="nav-left-actions" data-node-id="I4237:47643;1:15677">
            <button className="pill-button login-button" type="button" data-node-id="I4237:47643;1:15678">
              الدخول
            </button>
            <button className="icon-button" type="button" aria-label="بحث" data-node-id="1817:75770">
              <img src="/assets/figma/icon-search.svg" alt="" />
            </button>
          </div>
          <img className="nav-logo" src="/assets/figma/logo-nav.svg" alt="ثمانية" data-node-id="I4237:47643;1:15685" />
          <img className="navigation-divider" src="/assets/figma/nav-divider.svg" alt="" />
        </header>

        <div className="gift-card-stack">
          <div className={`gift-card-perspective${isError ? ' is-error' : ''}`}>
            <motion.div
              ref={cardSceneRef}
              className="gift-card-flip-scene"
              style={cardSceneStyle}
              data-active={isCardTiltActive ? 'true' : 'false'}
              data-parallax={isCardTiltParallax ? 'true' : 'false'}
              data-gyro={isGyroActive ? 'true' : 'false'}
              data-idle-sweep={isIdleSweepActive ? 'true' : 'false'}
              onPointerDown={() => {
                activateGyroRef.current?.()
              }}
              onPointerEnter={(event) => {
                setIsCardHovered(true)
                setIsCardParallax(false)
                const rect = event.currentTarget.getBoundingClientRect()
                const x = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1)
                const y = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1)
                const ratioX = 0.5 + (x - 0.5) * 2 * 0.5
                const ratioY = 0.5 + (y - 0.5) * 2 * 0.5
                event.currentTarget.style.setProperty('--ratio-x', ratioX.toFixed(4))
                event.currentTarget.style.setProperty('--ratio-y', ratioY.toFixed(4))
              }}
              onPointerMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect()
                const x = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1)
                const y = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1)
                const ratioX = 0.5 + (x - 0.5) * 2 * 0.5
                const ratioY = 0.5 + (y - 0.5) * 2 * 0.5
                event.currentTarget.style.setProperty('--ratio-x', ratioX.toFixed(4))
                event.currentTarget.style.setProperty('--ratio-y', ratioY.toFixed(4))
              }}
              onPointerLeave={() => {
                setIsCardHovered(false)
                setIsCardParallax(false)
              }}
              onTransitionEnd={(event) => {
                if (event.target !== event.currentTarget) return
                if (event.propertyName !== 'transform') return
                if (!isCardHovered) return
                setIsCardParallax(true)
              }}
            >
              <article className={`gift-card-flip-inner${isSuccess ? ' is-flipped' : ''}`} data-node-id="4237:48048">
                <div className="gift-card-panel gift-card-panel-front">
                  <div className="gift-card-panel-content">
                    <div className={`gift-card-front-dynamic${hasTypedCode ? ' is-filled' : ''}`}>
                      <div className="gift-card-symbol-wrap" data-node-id="4237:48050">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="74"
                          height="86"
                          viewBox="0 0 74 86"
                          fill="none"
                          className="gift-card-symbol"
                          role="img"
                          aria-label="شعار ثمانية"
                        >
                          <path
                            d="M19.0226 85.1055C29.6955 71.7435 34.0064 58.3626 35.8813 44.5395H37.6197C39.4946 58.3626 43.8056 71.7437 54.4784 85.1055H55.53L73.501 49.2707C52.5679 37.4284 44.1015 21.1339 38.1215 -0.000915527H35.3796C29.3996 21.1339 20.9331 37.4284 0 49.2707L17.971 85.1055H19.0226Z"
                            fill="white"
                          />
                        </svg>
                      </div>
                      <p className={`gift-card-front-code${isError ? ' is-error' : ''}`} data-node-id="4237:48052">
                        {frontCardText}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="gift-card-panel gift-card-panel-back" data-node-id="4237:47703">
                  <div className="gift-card-panel-content">
                    <div className="gift-card-back-offer" data-node-id="4556:59556">
                      <div className="gift-card-back-tag" data-node-id="4556:59563">
                        <img src="/assets/figma/icon-subscription.svg" alt="" className="gift-card-back-tag-icon" />
                        <p className="gift-card-back-tag-text">اشتــراك ثمانية</p>
                      </div>
                      <p className="gift-card-back-duration" data-node-id="4556:59564">
                        لمـدة 7 ايـــام
                      </p>
                    </div>
                    <div className="gift-card-back-meta" data-node-id="4556:59559">
                      <p className="gift-card-back-label" data-node-id="4556:59560">من</p>
                      <p className="gift-card-back-bank" data-node-id="4556:59571">بنك الراجحي</p>
                      <p className="gift-card-back-expiry" data-node-id="4556:59570">ينتهي في 12 مايو 2026</p>
                    </div>
                  </div>
                </div>
              </article>
            </motion.div>
          </div>

          <div className={`activate-button-reveal${isSuccess ? ' is-open' : ''}`}>
            <div className="activate-button-reveal-inner">
              <button className="activate-button activate-button-below" type="button">
                تفعيل الاشتراك
              </button>
            </div>
          </div>
        </div>

        <div className="redemption-panel" data-node-id="4237:47632">
          <h1 className="redemption-heading" data-node-id="4237:48115">
            استرد قسيمتك
          </h1>
          <p className="redemption-subtitle" data-node-id="4237:47635">
            أدخل رمز القسيمة أدناه
          </p>
          <form className="redemption-form" data-node-id="4237:47636" onSubmit={handleSubmit}>
            <div className="redemption-form-row" data-node-id="4237:47638">
              <button
                className="pill-button verify-button"
                type="submit"
                data-node-id="4237:47639"
                disabled={isLoading || isVerifyLocked}
              >
                تحقق من الرمز
              </button>
              <label className="voucher-field-wrap" data-node-id="4237:47640">
                <span className="sr-only">رمز القسيمة</span>
                <input
                  className="voucher-field"
                  type="text"
                  placeholder="رمز القسيمة"
                  value={voucherCode}
                  onFocus={() => {
                    setIsInputFocused(true)
                  }}
                  onBlur={() => {
                    setIsInputFocused(false)
                  }}
                  onChange={(event) => {
                    const nextCode = event.target.value.toUpperCase()
                    setVoucherCode(nextCode)
                    if (verificationState !== 'loading' && nextCode.trim() !== resolvedCode) {
                      setVerificationState('idle')
                    }
                  }}
                  disabled={verificationState === 'loading'}
                />
              </label>
            </div>
          </form>
        </div>
      </section>

      <footer className="footer" data-name="Footer" data-node-id="1817:73687">
        <div className="footer-inner" data-node-id="1817:73694">
          <div className="footer-links-area" data-node-id="1817:73695">
            <div className="footer-logo-wrap" data-node-id="1817:73696">
              <img className="footer-logo" src="/assets/figma/logo-footer.svg" alt="ثمانية" />
            </div>
            <nav className="footer-links" aria-label="روابط" data-node-id="1817:73698">
              {footerLinks.map((link) => (
                <a className="footer-link" key={link} href="#">{link}</a>
              ))}
            </nav>
          </div>
          <div className="footer-credits" data-node-id="1817:73704">
            <img className="footer-divider" src="/assets/figma/footer-divider.svg" alt="" />
            <div className="footer-bottom-row" data-node-id="1817:73706">
              <div className="social-links-group" data-node-id="1817:73707">
                <a href="#" className="lang-link">EN</a>
                <div className="social-icons">
                  {socialLinks.map((social) => (
                    <a key={social.name} href="#" aria-label={social.name} className="social-icon-link">
                      <img src={social.icon} alt="" />
                    </a>
                  ))}
                </div>
              </div>
              <p className="copyright">جميع الحقوق محفوظة لشركة ثمانية للنشر والتوزيع ©</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
