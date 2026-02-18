'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

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

// ─── Animation params (all durations in ms) ───────────────────────────────────
type CubicBezierObject = [number, number, number, number]

const DEFAULT_PARAMS = {
  // Card flip
  flipDuration: 800,
  flipEase: [0.645, 0.045, 0.355, 1.0] as CubicBezierObject,

  // Reveal height — OPEN
  revealOpenDelay: 800,
  revealOpenDuration: 480,
  revealOpenEase: [0.22, 1.0, 0.36, 1.0] as CubicBezierObject,

  // Reveal height — CLOSE
  revealCloseDelay: 0,
  revealCloseDuration: 360,
  revealCloseEase: [0.55, 0.0, 1.0, 0.45] as CubicBezierObject,

  // Button fade — OPEN
  buttonFadeOpenDelay: 1000,
  buttonFadeOpenDuration: 320,

  // Button fade — CLOSE
  buttonFadeCloseDelay: 0,
  buttonFadeCloseDuration: 150,

  // Fake loading delay
  loadingDelay: 1200,
}

function applyParams(params: typeof DEFAULT_PARAMS, el: HTMLElement) {
  const cb = (e: CubicBezierObject) => `cubic-bezier(${e[0]},${e[1]},${e[2]},${e[3]})`

  el.style.setProperty('--flip-duration', `${params.flipDuration}ms`)
  el.style.setProperty('--flip-ease', cb(params.flipEase))

  el.style.setProperty('--reveal-open-delay', `${params.revealOpenDelay}ms`)
  el.style.setProperty('--reveal-open-duration', `${params.revealOpenDuration}ms`)
  el.style.setProperty('--reveal-open-ease', cb(params.revealOpenEase))

  el.style.setProperty('--reveal-close-delay', `${params.revealCloseDelay}ms`)
  el.style.setProperty('--reveal-close-duration', `${params.revealCloseDuration}ms`)
  el.style.setProperty('--reveal-close-ease', cb(params.revealCloseEase))

  el.style.setProperty('--btn-fade-open-delay', `${params.buttonFadeOpenDelay}ms`)
  el.style.setProperty('--btn-fade-open-duration', `${params.buttonFadeOpenDuration}ms`)

  el.style.setProperty('--btn-fade-close-delay', `${params.buttonFadeCloseDelay}ms`)
  el.style.setProperty('--btn-fade-close-duration', `${params.buttonFadeCloseDuration}ms`)
}


export default function HomePage() {
  const [voucherCode, setVoucherCode] = useState('')
  const [verificationState, setVerificationState] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [resolvedCode, setResolvedCode] = useState('')
  const [isCardHovered, setIsCardHovered] = useState(false)
  const [isCardParallax, setIsCardParallax] = useState(false)
  const trimmedCode = voucherCode.trim()
  const successSoundRef = useRef<HTMLAudioElement | null>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const paramsRef = useRef({ ...DEFAULT_PARAMS })

  // ── Sound ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    successSoundRef.current = new Audio('/assets/figma/sr-sequence.mp3')
  }, [])

  // ── Apply default CSS vars on mount ───────────────────────────────────────
  useEffect(() => {
    if (pageRef.current) applyParams(paramsRef.current, pageRef.current)
  }, [])

  // ── Tweakpane ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let pane: import('tweakpane').Pane | null = null

    import('tweakpane').then(async ({ Pane, FolderApi }) => {
      pane = new Pane({ title: '🎛 Animation Params', expanded: true })
      const root = pane as unknown as InstanceType<typeof FolderApi>

      const p = paramsRef.current

      const update = () => {
        if (pageRef.current) applyParams(p, pageRef.current)
      }

      // Register the cubic-bezier graph plugin
      const { plugins } = await import('@tweakpane/plugin-essentials')
      pane.registerPlugin({ plugins })

      // ── Card flip ────────────────────────────────────────────────────────
      const flipFolder = root.addFolder({ title: '🃏 Card Flip' })
      flipFolder.addBinding(p, 'flipDuration', { label: 'Duration (ms)', min: 100, max: 2000, step: 10 }).on('change', update)
      flipFolder.addBinding(p, 'flipEase', { label: 'Easing', view: 'cubicbezier', expanded: true }).on('change', update)

      // ── Reveal height ────────────────────────────────────────────────────
      const revealFolder = root.addFolder({ title: '📦 Reveal Height' })
      const revealOpenFolder = revealFolder.addFolder({ title: '▶ Open' })
      revealOpenFolder.addBinding(p, 'revealOpenDelay', { label: 'Delay (ms)', min: 0, max: 2000, step: 10 }).on('change', update)
      revealOpenFolder.addBinding(p, 'revealOpenDuration', { label: 'Duration (ms)', min: 50, max: 2000, step: 10 }).on('change', update)
      revealOpenFolder.addBinding(p, 'revealOpenEase', { label: 'Easing', view: 'cubicbezier', expanded: true }).on('change', update)
      const revealCloseFolder = revealFolder.addFolder({ title: '◀ Close' })
      revealCloseFolder.addBinding(p, 'revealCloseDelay', { label: 'Delay (ms)', min: 0, max: 2000, step: 10 }).on('change', update)
      revealCloseFolder.addBinding(p, 'revealCloseDuration', { label: 'Duration (ms)', min: 50, max: 2000, step: 10 }).on('change', update)
      revealCloseFolder.addBinding(p, 'revealCloseEase', { label: 'Easing', view: 'cubicbezier', expanded: true }).on('change', update)

      // ── Button fade ──────────────────────────────────────────────────────
      const btnFolder = root.addFolder({ title: '✨ Button Fade' })
      const btnOpenFolder = btnFolder.addFolder({ title: '▶ Open' })
      btnOpenFolder.addBinding(p, 'buttonFadeOpenDelay', { label: 'Delay (ms)', min: 0, max: 3000, step: 10 }).on('change', update)
      btnOpenFolder.addBinding(p, 'buttonFadeOpenDuration', { label: 'Duration (ms)', min: 50, max: 2000, step: 10 }).on('change', update)
      const btnCloseFolder = btnFolder.addFolder({ title: '◀ Close' })
      btnCloseFolder.addBinding(p, 'buttonFadeCloseDelay', { label: 'Delay (ms)', min: 0, max: 3000, step: 10 }).on('change', update)
      btnCloseFolder.addBinding(p, 'buttonFadeCloseDuration', { label: 'Duration (ms)', min: 50, max: 2000, step: 10 }).on('change', update)

      // ── Loading delay ────────────────────────────────────────────────────
      const miscFolder = root.addFolder({ title: '⏳ Misc' })
      miscFolder.addBinding(p, 'loadingDelay', { label: 'Loading delay (ms)', min: 0, max: 5000, step: 50 })

      // ── Log values button ────────────────────────────────────────────────
      root.addButton({ title: '📋 Log values to console' }).on('click', () => {
        console.log('Current animation params:', JSON.stringify(p, null, 2))
      })

    })

    return () => {
      pane?.dispose()
    }
  }, [])

  const isLoading = verificationState === 'loading'
  const isSuccess = verificationState === 'success'
  const isError = verificationState === 'error'

  const cardText =
    isLoading
      ? 'جاري التحقق'
      : isError
        ? 'انتهت صلاحية هذا الرمز'
        : trimmedCode || 'قسيمـــة هديـــة'

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (verificationState === 'loading') return
    if (!trimmedCode) {
      setVerificationState('idle')
      return
    }
    if (verificationState === 'success' && trimmedCode === resolvedCode) return

    setVerificationState('loading')
    const currentCode = trimmedCode

    setTimeout(() => {
      if (currentCode === 'AA123') {
        setVerificationState('error')
        setResolvedCode(currentCode)
        return
      }

      setVerificationState('success')
      setResolvedCode(currentCode)
      if (successSoundRef.current) {
        successSoundRef.current.currentTime = 0
        successSoundRef.current.play().catch(() => {})
      }
    }, paramsRef.current.loadingDelay)
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
              className="gift-card-flip-scene"
              style={{ transformStyle: 'preserve-3d' }}
              data-active={isCardHovered ? 'true' : 'false'}
              data-parallax={isCardParallax ? 'true' : 'false'}
              onPointerEnter={(event) => {
                setIsCardHovered(true)
                setIsCardParallax(false)
                const rect = event.currentTarget.getBoundingClientRect()
                const x = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1)
                const y = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1)
                const centeredX = (x - 0.5) * 2
                const centeredY = (y - 0.5) * 2
                const ratioX = 0.5 + centeredX * 0.5
                const ratioY = 0.5 + centeredY * 0.5

                event.currentTarget.style.setProperty('--ratio-x', ratioX.toFixed(4))
                event.currentTarget.style.setProperty('--ratio-y', ratioY.toFixed(4))
              }}
              onPointerMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect()
                const x = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1)
                const y = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1)
                const centeredX = (x - 0.5) * 2
                const centeredY = (y - 0.5) * 2
                const ratioX = 0.5 + centeredX * 0.5
                const ratioY = 0.5 + centeredY * 0.5

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
                    <div className="gift-card-panel-header" data-node-id="4237:48049">
                      <img src="/assets/figma/logo-card.svg" alt="ثمانية" className="gift-card-logo" data-node-id="4237:48050" />
                    </div>
                    <p className={`gift-card-panel-title${isError ? ' is-error' : ''}`} data-node-id="4237:48052">
                      {isLoading ? (
                        <span className="loading-copy">
                          <span className="loading-text">{cardText}</span>
                          <span className="loading-dots">...</span>
                        </span>
                      ) : (
                        cardText
                      )}
                    </p>
                  </div>
                </div>
                <div className="gift-card-panel gift-card-panel-back" data-node-id="4237:47703">
                  <div className="gift-card-panel-content">
                    <div className="gift-card-back-header">
                      <img src="/assets/figma/logo-card.svg" alt="ثمانية" className="gift-card-back-logo" />
                      <p className="gift-card-back-title">قسيمة هدية</p>
                    </div>

                    <div className="gift-reward-panel" data-node-id="4237:47707">
                      <div className="reward-details">
                        <div className="reward-title-row">
                          <img src="/assets/figma/icon-subscription.svg" alt="" className="reward-icon" />
                          <p className="reward-title">اشتــراك ثمانية</p>
                        </div>
                        <p className="reward-duration">اشتراك لمدة 7 ايام</p>
                      </div>
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
            استرداد هديتك
          </h1>
          <p className="redemption-subtitle" data-node-id="4237:47635">
            أدخل رمز القسيمة أدناه
          </p>
          <form
            className="redemption-form"
            data-node-id="4237:47636"
            onSubmit={handleSubmit}
          >
            <div className="redemption-form-row" data-node-id="4237:47638">
              <button
                className="pill-button verify-button"
                type="submit"
                data-node-id="4237:47639"
                disabled={verificationState === 'loading'}
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
                <a className="footer-link" key={link} href="#">
                  {link}
                </a>
              ))}
            </nav>
          </div>

          <div className="footer-credits" data-node-id="1817:73704">
            <img className="footer-divider" src="/assets/figma/footer-divider.svg" alt="" />
            <div className="footer-bottom-row" data-node-id="1817:73706">
              <div className="social-links-group" data-node-id="1817:73707">
                <a href="#" className="lang-link">
                  EN
                </a>
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
