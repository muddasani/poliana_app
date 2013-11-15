PolianaApp::Application.routes.draw do
  get "bills/:id", :to =>"bills#show"

  get "bills/", :to=>"bills#all"

  mount RailsAdmin::Engine => '/admin', :as => 'rails_admin'

  resources :invitations

  devise_for :users, :path => '', :path_names => { :sign_in => "signin", :sign_out => "signout", :sign_up => "120938102948019283" },
			:controllers => { omniauth_callbacks: "auth_callbacks" }
			
  devise_scope :user do
	  get "/signup/:key" => "beta#new", :as => :beta_signup
	  post "beta/" => "beta#create", :as => :beta_registration
  end
  
  get "/login", :to => redirect('/signin')
  get "/logout", :to => redirect('/signout')
  get "/signup", :to => redirect('/')
  get "about", :to => "static_pages#about"
  get "policy", :to => "static_pages#policy"
  get "terms", :to => "static_pages#terms"
  get "mailchimp_signup", :to => "static_pages#mailchimp_signup"
  get "team", :to => "static_pages#team"
  get "contact", :to => "static_pages#contact"
  get "faq", :to => "static_pages#faq"
  get "mission", :to => "static_pages#mission"
  get "kitchensink", :to => "static_pages#kitchen"

  get "search", :to => "search#search"
  get "bills", :to => "static_pages#bills"

  get "invite", :to => "invitations#new"
  
  get "/404", :to => "errors#not_found"
  get "/422", :to => "errors#unacceptable"
  get "/500", :to => "errors#internal_error"

  root :to => "static_pages#index"
end