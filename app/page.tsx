'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

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
  const prefersReducedMotion = useReducedMotion()
  const trimmedCode = voucherCode.trim()
  const isLoading = verificationState === 'loading'
  const isSuccess = verificationState === 'success'
  const isError = verificationState === 'error'

  const cardText =
    isLoading
      ? 'جاري التحقق'
      : isError
        ? 'انتهت صلاحية هذا الرمز'
        : trimmedCode || 'قسيمـــة هديـــة'

  return (
    <div className="gift-card-page" data-name="Home" data-node-id="4237:47628">
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

        <div className="gift-card-perspective">
          <motion.div
            className="gift-card-flip-scene"
            style={{ transformStyle: 'preserve-3d' }}
            data-active={isCardHovered ? 'true' : 'false'}
            data-parallax={isCardParallax ? 'true' : 'false'}
            onPointerEnter={() => {
              setIsCardHovered(true)
              setIsCardParallax(false)
            }}
            onPointerMove={(event) => {
              if (prefersReducedMotion) return
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
            onPointerLeave={(event) => {
              setIsCardHovered(false)
              setIsCardParallax(false)
              event.currentTarget.style.setProperty('--ratio-x', '0.5')
              event.currentTarget.style.setProperty('--ratio-y', '0.5')
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
                    <button className="activate-button" type="button">
                      تفعيل الاشتراك
                    </button>

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
            onSubmit={(event) => {
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
              }, 1200)
            }}
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
