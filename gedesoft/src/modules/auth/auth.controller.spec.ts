import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with dto and return result', async () => {
      const dto: AuthDto = {
        nombreUsuario: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const result = { message: 'User registered' };
      mockAuthService.register.mockResolvedValue(result);

      const response = await controller.register(dto);
      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(response).toEqual(result);
    });
  });

  describe('login', () => {
    it('should call authService.login with email and password and return result', async () => {
      const dto: AuthDto = {
        nombreUsuario: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const result = { access_token: 'jwt-token' };
      mockAuthService.login.mockResolvedValue(result);

      const response = await controller.login(dto);
      expect(authService.login).toHaveBeenCalledWith(dto.email, dto.password);
      expect(response).toEqual(result);
    });
  });
});
